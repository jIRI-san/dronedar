use sim_protocol::{Command, ErrorCode, ProtocolError, Telemetry};

pub const DEFAULT_TICK_DURATION_US: u64 = 100_000;

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct SimClock {
    tick: u64,
    tick_duration_us: u64,
    paused: bool,
}

impl Default for SimClock {
    fn default() -> Self {
        Self::new(DEFAULT_TICK_DURATION_US)
    }
}

impl SimClock {
    pub fn new(tick_duration_us: u64) -> Self {
        Self {
            tick: 0,
            tick_duration_us,
            paused: true,
        }
    }

    #[cfg(test)]
    fn with_state(tick: u64, tick_duration_us: u64, paused: bool) -> Self {
        Self {
            tick,
            tick_duration_us,
            paused,
        }
    }

    pub fn telemetry(&self) -> Result<Telemetry, ProtocolError> {
        let simulation_time_us = self
            .tick
            .checked_mul(self.tick_duration_us)
            .ok_or_else(|| ProtocolError {
                code: ErrorCode::ClockOverflow,
                message: "simulation_time_us overflowed u64.".to_owned(),
            })?;
        Ok(Telemetry {
            tick: self.tick,
            tick_duration_us: self.tick_duration_us,
            simulation_time_us,
            paused: self.paused,
        })
    }

    pub fn execute(&mut self, command: Command) -> Result<Telemetry, ProtocolError> {
        match command {
            Command::Pause => self.paused = true,
            Command::Resume => self.paused = false,
            Command::Step => {
                if !self.paused {
                    return Err(ProtocolError {
                        code: ErrorCode::StepWhileRunning,
                        message: "Step is only valid while paused.".to_owned(),
                    });
                }
                self.advance()?;
            }
            Command::Reset => {
                self.tick = 0;
                self.paused = true;
            }
            Command::GetClock => {}
            Command::InjectTick => {
                if !self.paused {
                    self.advance()?;
                }
            }
        }
        self.telemetry()
    }

    fn advance(&mut self) -> Result<(), ProtocolError> {
        let next_tick = self.tick.checked_add(1).ok_or_else(|| ProtocolError {
            code: ErrorCode::ClockOverflow,
            message: "tick overflowed u64.".to_owned(),
        })?;
        next_tick
            .checked_mul(self.tick_duration_us)
            .ok_or_else(|| ProtocolError {
                code: ErrorCode::ClockOverflow,
                message: "simulation_time_us overflowed u64.".to_owned(),
            })?;
        self.tick = next_tick;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn initial_clock_is_paused() {
        let clock = SimClock::default();
        assert_eq!(
            clock.telemetry().expect("telemetry"),
            Telemetry {
                tick: 0,
                tick_duration_us: DEFAULT_TICK_DURATION_US,
                simulation_time_us: 0,
                paused: true,
            }
        );
    }

    #[test]
    fn pause_and_resume_are_idempotent() {
        let mut clock = SimClock::default();
        clock.execute(Command::Pause).expect("first pause");
        clock.execute(Command::Pause).expect("second pause");
        clock.execute(Command::Resume).expect("first resume");
        assert!(
            !clock
                .execute(Command::Resume)
                .expect("second resume")
                .paused
        );
    }

    #[test]
    fn step_advances_exactly_one_tick_when_paused() {
        let mut clock = SimClock::default();
        let telemetry = clock.execute(Command::Step).expect("step");
        assert_eq!(telemetry.tick, 1);
        assert_eq!(telemetry.simulation_time_us, DEFAULT_TICK_DURATION_US);
        assert!(telemetry.paused);
    }

    #[test]
    fn step_while_running_preserves_state() {
        let mut clock = SimClock::default();
        clock.execute(Command::Resume).expect("resume");
        let before = clock.telemetry().expect("before");
        let error = clock
            .execute(Command::Step)
            .expect_err("step must be rejected");
        assert_eq!(error.code, ErrorCode::StepWhileRunning);
        assert_eq!(clock.telemetry().expect("after"), before);
    }

    #[test]
    fn reset_is_paused_and_zeroed() {
        let mut clock = SimClock::default();
        clock.execute(Command::Step).expect("step");
        clock.execute(Command::Resume).expect("resume");
        assert_eq!(
            clock.execute(Command::Reset).expect("reset"),
            Telemetry {
                tick: 0,
                tick_duration_us: DEFAULT_TICK_DURATION_US,
                simulation_time_us: 0,
                paused: true,
            }
        );
    }

    #[test]
    fn injected_ticks_only_advance_running_clock() {
        let mut clock = SimClock::default();
        assert_eq!(
            clock
                .execute(Command::InjectTick)
                .expect("paused tick")
                .tick,
            0
        );
        clock.execute(Command::Resume).expect("resume");
        assert_eq!(
            clock
                .execute(Command::InjectTick)
                .expect("running tick")
                .tick,
            1
        );
    }

    #[test]
    fn overflow_preserves_state() {
        let mut clock = SimClock::with_state(u64::MAX, 1, true);
        let before = clock.clone();
        let error = clock
            .execute(Command::Step)
            .expect_err("overflow must fail");
        assert_eq!(error.code, ErrorCode::ClockOverflow);
        assert_eq!(clock, before);
    }

    #[test]
    fn identical_command_and_tick_replays_match() {
        let events = [
            Command::Resume,
            Command::InjectTick,
            Command::InjectTick,
            Command::Pause,
            Command::Step,
            Command::Reset,
        ];
        let mut first = SimClock::default();
        let mut second = SimClock::default();
        for event in events {
            assert_eq!(
                first.execute(event.clone()).expect("first replay"),
                second.execute(event).expect("second replay")
            );
        }
    }
}
