use cubiomes::generator::Generator;
use cubiomes::generator::GeneratorFlags;
use cubiomes::structures::StructureRegion;
use cubiomes::enums::MCVersion;
use cubiomes::enums::StructureType;
use parking_lot::Mutex;
use serde::Serialize;

pub fn structure(x:i32 ,z: i32, structure: StructureType , data: &StructureData)->Option<StructurePos>{

    let region = StructureRegion::new(x,z,data.get_version(),structure).unwrap();
    let pos = region.get_structure_generation_attempt(data.get_seed())?;
    let mut generator = data.generator.lock();
    let exists = generator.verify_structure_generation_attempt(pos, structure).ok()?;
    return Some(StructurePos{
        x: pos.x,
        z: pos.z,
        exists // Might be worth actually checking if the structure is genrerated but for now just imagine it is.
    });
}

#[derive(Serialize)]
pub struct StructurePos{
    pub x:i32,
    pub z:i32,
    pub exists:bool
}

pub struct StructureData{
    pub generator: Mutex<Generator>,
    version: MCVersion,
    seed: i64
}

impl StructureData {
    pub fn new(seed: i64, version: MCVersion) -> Self {
        StructureData{
            generator: Mutex::new(Generator::new(version, seed, cubiomes::enums::Dimension::DIM_OVERWORLD, GeneratorFlags::empty())),
            version,
            seed,
        }
    }
    pub fn get_version(&self)->MCVersion{
        self.version
    }
    pub fn get_seed(&self)->i64{
        self.seed
    }
}

pub fn structure_from_string(string: &String)->StructureType{
    StructureType::Outpost
}