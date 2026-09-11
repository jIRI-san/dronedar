use serde::{Deserialize, Serialize};
use serde_json::Value;
use ts_rs::{Config, TS};

pub const PROTOCOL_VERSION: u32 = 1;

mod u64_string {
    use serde::{Deserialize, Deserializer, Serializer};

    pub fn serialize<S>(value: &u64, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(&value.to_string())
    }

    pub fn deserialize<'de, D>(deserializer: D) -> Result<u64, D::Error>
    where
        D: Deserializer<'de>,
    {
        let value = String::deserialize(deserializer)?;
        value.parse().map_err(serde::de::Error::custom)
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize, TS)]
pub struct RequestEnvelope {
    pub protocol_version: u32,
    pub request_id: Option<String>,
    pub command: Command,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(tag = "type", content = "payload", rename_all = "snake_case")]
pub enum Command {
    Pause,
    Resume,
    Step,
    Reset,
    GetClock,
    InjectTick,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize, TS)]
pub struct Telemetry {
    #[serde(with = "u64_string")]
    #[ts(type = "string")]
    pub tick: u64,
    #[serde(with = "u64_string")]
    #[ts(type = "string")]
    pub tick_duration_us: u64,
    #[serde(with = "u64_string")]
    #[ts(type = "string")]
    pub simulation_time_us: u64,
    pub paused: bool,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(rename_all = "snake_case")]
pub enum ErrorCode {
    InvalidJson,
    UnsupportedVersion,
    InvalidEnvelope,
    UnknownCommand,
    InvalidPayload,
    StepWhileRunning,
    ClockOverflow,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize, TS)]
pub struct ProtocolError {
    pub code: ErrorCode,
    pub message: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ResponseEnvelope {
    Telemetry {
        protocol_version: u32,
        request_id: Option<String>,
        telemetry: Telemetry,
    },
    Error {
        protocol_version: u32,
        request_id: Option<String>,
        error: ProtocolError,
    },
}

impl ResponseEnvelope {
    pub fn telemetry(request_id: Option<String>, telemetry: Telemetry) -> Self {
        Self::Telemetry {
            protocol_version: PROTOCOL_VERSION,
            request_id,
            telemetry,
        }
    }

    pub fn error(request_id: Option<String>, code: ErrorCode, message: impl Into<String>) -> Self {
        Self::Error {
            protocol_version: PROTOCOL_VERSION,
            request_id,
            error: ProtocolError {
                code,
                message: message.into(),
            },
        }
    }
}

pub fn parse_request(input: &str) -> Result<RequestEnvelope, ResponseEnvelope> {
    let value: Value = serde_json::from_str(input).map_err(|_| {
        ResponseEnvelope::error(None, ErrorCode::InvalidJson, "Request is not valid JSON.")
    })?;

    let object = value.as_object().ok_or_else(|| {
        ResponseEnvelope::error(
            None,
            ErrorCode::InvalidEnvelope,
            "Request must be a JSON object.",
        )
    })?;
    let usable_request_id = object
        .get("request_id")
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .map(ToOwned::to_owned);

    let protocol_version = object
        .get("protocol_version")
        .and_then(Value::as_u64)
        .and_then(|value| u32::try_from(value).ok())
        .ok_or_else(|| {
            ResponseEnvelope::error(
                usable_request_id.clone(),
                ErrorCode::InvalidEnvelope,
                "protocol_version must be an unsigned integer.",
            )
        })?;

    if protocol_version != PROTOCOL_VERSION {
        return Err(ResponseEnvelope::error(
            usable_request_id,
            ErrorCode::UnsupportedVersion,
            format!("Protocol version {protocol_version} is not supported."),
        ));
    }

    let command = object.get("command").ok_or_else(|| {
        ResponseEnvelope::error(
            usable_request_id.clone(),
            ErrorCode::InvalidEnvelope,
            "command is required.",
        )
    })?;
    let parsed_command = serde_json::from_value::<Command>(command.clone()).map_err(|error| {
        let code = if error.to_string().contains("unknown variant") {
            ErrorCode::UnknownCommand
        } else {
            ErrorCode::InvalidPayload
        };
        ResponseEnvelope::error(usable_request_id.clone(), code, error.to_string())
    })?;
    let request_id = match (object.get("request_id"), &parsed_command) {
        (Some(Value::String(value)), _) if !value.trim().is_empty() => Some(value.to_owned()),
        (None | Some(Value::Null), Command::InjectTick) => None,
        _ => {
            return Err(ResponseEnvelope::error(
                None,
                ErrorCode::InvalidEnvelope,
                "request_id must be a non-empty string except for scheduler ticks.",
            ));
        }
    };

    Ok(RequestEnvelope {
        protocol_version,
        request_id,
        command: parsed_command,
    })
}

pub fn typescript_declarations() -> String {
    let config = Config::default();
    let declarations = [
        RequestEnvelope::decl(&config),
        Command::decl(&config),
        Telemetry::decl(&config),
        ErrorCode::decl(&config),
        ProtocolError::decl(&config),
        ResponseEnvelope::decl(&config),
    ];
    format!(
        "// This file is generated by `npm run protocol:generate`. Do not edit.\n\n{}\n",
        declarations
            .join("\n\n")
            .lines()
            .map(|line| {
                if line.starts_with("type ") {
                    format!("export {line}")
                } else {
                    line.to_owned()
                }
            })
            .collect::<Vec<_>>()
            .join("\n")
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_tagged_command_with_correlation() {
        let request = parse_request(
            r#"{"protocol_version":1,"request_id":"request-1","command":{"type":"step"}}"#,
        )
        .expect("valid protocol request");
        assert_eq!(request.request_id.as_deref(), Some("request-1"));
        assert_eq!(request.command, Command::Step);
    }

    #[test]
    fn returns_uncorrelated_error_for_invalid_json() {
        let error = parse_request("{").expect_err("invalid JSON must fail");
        assert_eq!(
            error,
            ResponseEnvelope::error(None, ErrorCode::InvalidJson, "Request is not valid JSON.")
        );
    }

    #[test]
    fn returns_typed_error_for_unknown_command_without_state_concerns() {
        let error = parse_request(
            r#"{"protocol_version":1,"request_id":"request-1","command":{"type":"spin"}}"#,
        )
        .expect_err("unknown command must fail");
        assert!(matches!(
            error,
            ResponseEnvelope::Error {
                request_id: Some(ref request_id),
                error: ProtocolError {
                    code: ErrorCode::UnknownCommand,
                    ..
                },
                ..
            } if request_id == "request-1"
        ));
    }

    #[test]
    fn rejects_invalid_correlation_ids_for_regular_commands() {
        let error =
            parse_request(r#"{"protocol_version":1,"request_id":"","command":{"type":"resume"}}"#)
                .expect_err("blank request ID must fail");
        assert_eq!(
            error,
            ResponseEnvelope::error(
                None,
                ErrorCode::InvalidEnvelope,
                "request_id must be a non-empty string except for scheduler ticks.",
            )
        );
    }
}
