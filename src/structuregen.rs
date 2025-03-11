use cubiomes::structures::StructureRegion;
use cubiomes::enums::MCVersion;
use cubiomes::enums::StructureType;
use serde::Serialize;

pub fn structure(x:i32 ,z: i32 ,seed: i64)->Option<StructurePos>{
    let region = StructureRegion::new(x,z,MCVersion::MC_1_21_WD,StructureType::Outpost).unwrap();
    let pos = region.get_structure_generation_attempt(seed)?;
    return Some(StructurePos{
        x: pos.x,
        z: pos.z,
        exists: true // Might be worth actually checking if the structure is genrerated but for now just imagine it is.
    });
}

#[derive(Serialize)]
pub struct StructurePos{
    pub x:i32,
    pub z:i32,
    pub exists:bool
}