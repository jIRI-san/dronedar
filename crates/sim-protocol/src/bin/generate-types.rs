use std::{env, fs, path::PathBuf};

fn main() {
    let output = env::args_os()
        .nth(1)
        .map(PathBuf::from)
        .expect("usage: generate-types <output-path>");
    let parent = output
        .parent()
        .expect("output path must have a parent directory");
    fs::create_dir_all(parent).expect("create generated declaration directory");
    fs::write(&output, sim_protocol::typescript_declarations())
        .unwrap_or_else(|error| panic!("write {}: {error}", output.display()));
}
