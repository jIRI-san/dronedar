use sim_core::SimClock;
use sim_protocol::{ResponseEnvelope, parse_request};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Simulation {
    clock: SimClock,
}

#[wasm_bindgen]
impl Simulation {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            clock: SimClock::default(),
        }
    }

    pub fn dispatch(&mut self, request_json: &str) -> String {
        let response = match parse_request(request_json) {
            Ok(request) => match self.clock.execute(request.command) {
                Ok(telemetry) => ResponseEnvelope::telemetry(request.request_id, telemetry),
                Err(error) => ResponseEnvelope::Error {
                    protocol_version: sim_protocol::PROTOCOL_VERSION,
                    request_id: request.request_id,
                    error,
                },
            },
            Err(error) => error,
        };
        serde_json::to_string(&response).expect("protocol response must serialize")
    }
}

impl Default for Simulation {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn malformed_request_leaves_clock_unchanged() {
        let mut simulation = Simulation::new();
        let before = simulation.dispatch(
            r#"{"protocol_version":1,"request_id":"before","command":{"type":"get_clock"}}"#,
        );
        let invalid = simulation.dispatch("{");
        let after = simulation.dispatch(
            r#"{"protocol_version":1,"request_id":"after","command":{"type":"get_clock"}}"#,
        );
        assert!(invalid.contains("\"invalid_json\""));
        assert!(before.contains("\"tick\":\"0\""));
        assert!(after.contains("\"tick\":\"0\""));
    }

    #[test]
    fn invalid_correlation_id_leaves_clock_unchanged() {
        let mut simulation = Simulation::new();
        let invalid = simulation
            .dispatch(r#"{"protocol_version":1,"request_id":7,"command":{"type":"resume"}}"#);
        let after = simulation.dispatch(
            r#"{"protocol_version":1,"request_id":"after","command":{"type":"get_clock"}}"#,
        );
        assert!(invalid.contains("\"invalid_envelope\""));
        assert!(after.contains("\"paused\":true"));
    }
}
