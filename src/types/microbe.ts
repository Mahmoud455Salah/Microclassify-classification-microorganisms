export type MicrobeGroup = 'Bacteria' | 'Virus' | 'Fungi' | 'Protozoa' | 'Helminth' | 'Helminths' | 'Archaea' | 'Microalgae';

export type CellularType = 'Prokaryotic' | 'Eukaryotic' | 'Acellular (Virus)';

export type GramStainType = 'Gram-Positive' | 'Gram-Negative' | 'Acid-Fast' | 'N/A (Acellular / Wall-less)';

export type ShapeType =
  | 'Bacillus (Rod)'
  | 'Coccus (Spherical)'
  | 'Spirillum / Spirochete'
  | 'Vibrio (Comma)'
  | 'Filamentous / Hyphal'
  | 'Icosahedral'
  | 'Complex / Binal'
  | 'Bullet-shaped'
  | 'Yeast (Ovoid)'
  | 'Amoeboid'
  | 'Ciliated / Slipper'
  | 'Flagellated Protist'
  | 'Helminth (Worm) / Ovum';

export type OxygenReq =
  | 'Obligate Aerobe'
  | 'Facultative Anaerobe'
  | 'Obligate Anaerobe'
  | 'Microaerophile'
  | 'Aerotolerant'
  | 'N/A (Virus)';

export type BiosafetyLevel = 'BSL-1' | 'BSL-2' | 'BSL-3' | 'BSL-4';

export interface TaxonomyHierarchy {
  domain: string;
  kingdom: string;
  phylum: string;
  classTaxon: string;
  orderTaxon: string;
  family: string;
  genus: string;
  species: string;
  strainOrGroup?: string;
}

export interface MorphologyData {
  shape: ShapeType;
  arrangement: string;
  gramStatus: GramStainType;
  cellWallStructure: string;
  dimensions: string;
  motility: string;
  sporeFormation: string;
}

export interface BiochemicalProfile {
  indole: 'Positive' | 'Negative' | 'N/A';
  methylRed: 'Positive' | 'Negative' | 'N/A';
  vogesProskauer: 'Positive' | 'Negative' | 'N/A';
  citrate: 'Positive' | 'Negative' | 'N/A';
  urease: 'Positive' | 'Negative' | 'N/A';
  tsiSlant: 'Acid (Yellow)' | 'Alkaline (Red)' | 'N/A';
  tsiButt: 'Acid (Yellow)' | 'Alkaline (Red)' | 'N/A';
  tsiH2S: 'Positive (Black)' | 'Negative' | 'N/A';
  tsiGas: 'Positive (Cracks/Bubbles)' | 'Negative' | 'N/A';
  motilitySim: 'Motile (Diffuse)' | 'Non-motile (Stab line)' | 'N/A';
  hemolysis?: 'Alpha (Green)' | 'Beta (Clear)' | 'Gamma (None)' | 'N/A';
}

export interface PhysiologyData {
  oxygenRequirement: OxygenReq;
  trophicType: string;
  catalase: 'Positive' | 'Negative' | 'N/A' | string;
  oxidase: 'Positive' | 'Negative' | 'N/A' | string;
  optimalTemp: string;
  optimalPh: string;
  uniqueMetabolicFeatures: string[];
  biochemicals: BiochemicalProfile;
}

export interface AntibioticSusceptibilityRecord {
  antibiotic: string;
  diskContent: string;
  zoneDiameterMm: number;
  interpretation: 'Sensitive' | 'Intermediate' | 'Resistant';
  mechanism?: string;
}

export interface PathologyData {
  biosafetyLevel: BiosafetyLevel;
  clinicalRole:
    | 'Primary Pathogen'
    | 'Opportunistic Pathogen'
    | 'Commensal / Normal Flora'
    | 'Beneficial / Industrial'
    | 'Model Organism';
  diseases: string[];
  virulenceFactors: string[];
  treatmentTargets: string[];
  antibioticSensitivity?: string[];
  susceptibilityProfile?: AntibioticSusceptibilityRecord[];
}

export interface VisualRenderData {
  svgType:
    | 'gram_pos_cocci_cluster'
    | 'gram_pos_cocci_chain'
    | 'gram_neg_bacilli'
    | 'acid_fast_bacilli'
    | 'spore_bacilli'
    | 'spirochete'
    | 'vibrio'
    | 't4_bacteriophage'
    | 'coronavirus'
    | 'influenza'
    | 'budding_yeast'
    | 'mold_conidiophore'
    | 'paramecium'
    | 'giardia'
    | 'amoeba'
    | 'halophile_archaea'
    | 'chlamydomonas_alga'
    | 'spirulina_filament'
    | 'schistosoma_cercaria'
    | 'ascaris_ovum'
    | 'taenia_scolex';
  stainColor: string;
  accentColor: string;
  flagellaCount?: number;
  hasCapsule?: boolean;
  hasSpores?: boolean;
}

export interface Microorganism {
  id: string;
  scientificName: string;
  commonName: string;
  microbeGroup: MicroGroup;
  cellularType: CellularType;
  taxonomy: TaxonomyHierarchy;
  morphology: MorphologyData;
  physiology: PhysiologyData;
  pathology: PathologyData;
  ecologicalOrIndustrialRole: string;
  diagnosticCriteria: string[];
  visual: VisualRenderData;
  // PRIORITY 1: Scientific safety, sources & verification
  sources: string[];
  reviewed: boolean;
  reviewedBy: string;
  reviewDate: string;
}

export type MicroGroup = MicrobeGroup;

export interface DichotomousOption {
  text: string;
  explanation: string;
  nextNodeId?: string;
  candidateMicrobeIds: string[];
}

export interface DichotomousNode {
  id: string;
  question: string;
  category: 'Cellularity' | 'Gram Stain' | 'Morphology' | 'Physiology' | 'Biochemical';
  educationalContext: string;
  options: DichotomousOption[];
}

export interface ClassificationReport {
  id?: string;
  timestamp?: string;
  scientificName: string;
  commonName: string;
  microbeGroup: string;
  domain: string;
  kingdom?: string;
  phylum?: string;
  classTaxon?: string;
  orderTaxon?: string;
  family?: string;
  genus?: string;
  species?: string;
  strainOrGroup?: string;
  confidenceScore: number;
  morphology: {
    shape: string;
    arrangement: string;
    gramStatus: string;
    cellWallStructure: string;
    dimensions: string;
    motility: string;
    sporeFormation?: string;
  };
  physiology: {
    respiration: string;
    trophicType: string;
    catalase: string;
    oxidase: string;
    optimalTemp?: string;
    optimalPh?: string;
  };
  clinicalOrEcologicalSignificance: {
    biosafetyLevel: string;
    clinicalRole: string;
    associatedDiseases: string[];
    virulenceFactors: string[];
    treatmentOrControl: string[];
    ecologicalOrIndustrialRole?: string;
  };
  differentialDiagnosis: Array<{
    organismName: string;
    distinguishingFeatures: string;
  }>;
  diagnosticWorkflow: string[];
  classificationRationale: string;
  disclaimer: string;
}

export interface QuizQuestion {
  id: string;
  questionEn: string;
  questionAr: string;
  category: 'Gram Stain & Morphology' | 'Biochemical Identification' | 'Clinical Vignette' | 'Resistance & Mechanisms';
  optionsEn: string[];
  optionsAr: string[];
  correctIndex: number;
  explanationEn: string;
  explanationAr: string;
  linkedMicrobeId?: string;
}

export interface MlFeatureVector {
  gram: number; // 0=neg, 1=pos, 2=acid-fast, 3=na
  shape: number; // 0=rod, 1=coccus, 2=spirochete, 3=vibrio, 4=yeast, 5=other
  oxygen: number; // 0=aerobe, 1=facultative, 2=anaerobe, 3=microaerophile, 4=na
  catalase: number; // 0=neg, 1=pos
  oxidase: number; // 0=neg, 1=pos
  indole: number; // 0=neg, 1=pos
  methylRed: number; // 0=neg, 1=pos
  vogesProskauer: number; // 0=neg, 1=pos
  citrate: number; // 0=neg, 1=pos
  urease: number; // 0=neg, 1=pos
  motility: number; // 0=non-motile, 1=motile
  spores: number; // 0=no, 1=yes
}
