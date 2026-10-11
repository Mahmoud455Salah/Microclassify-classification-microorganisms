import { DichotomousNode } from '../types/microbe';

export const DICHOTOMOUS_TREE: Record<string, DichotomousNode> = {
  'root-cellularity': {
    id: 'root-cellularity',
    question: 'Is the microorganism Cellular or Acellular?',
    category: 'Cellularity',
    educationalContext:
      'The foundational taxonomic divide in microbiology separates autonomous cellular life (equipped with lipid membranes, ribosomes, and independent metabolism) from acellular infectious agents (viruses and viroids) requiring host machinery for replication.',
    options: [
      {
        text: 'Cellular (Contains plasma membrane, cytoplasm, independent DNA/RNA, and ribosomes)',
        explanation: 'Encompasses all Bacteria, Archaea, Fungi, Protists, and Microalgae.',
        nextNodeId: 'node-cellular-domain',
        candidateMicrobeIds: [
          'escherichia-coli',
          'staphylococcus-aureus',
          'mycobacterium-tuberculosis',
          'bacillus-anthracis',
          'streptococcus-pneumoniae',
          'pseudomonas-aeruginosa',
          'clostridium-botulinum',
          'treponema-pallidum',
          'vibrio-cholerae',
          'saccharomyces-cerevisiae',
          'penicillium-chrysogenum',
          'candida-albicans',
          'plasmodium-falciparum',
          'giardia-lamblia',
          'paramecium-caudatum',
          'halobacterium-salinarum',
          'methanobrevibacter-smithii',
          'chlamydomonas-reinhardtii',
        ],
      },
      {
        text: 'Acellular (Obligate intracellular agent composed of nucleic acid inside a protein capsid ± lipid envelope; no ribosomes)',
        explanation: 'Encompasses all Viruses, Bacteriophages, and Subviral particles.',
        nextNodeId: 'node-virus-genome',
        candidateMicrobeIds: ['sars-cov-2', 'enterobacteria-phage-t4', 'influenza-a', 'ebolavirus'],
      },
    ],
  },

  'node-virus-genome': {
    id: 'node-virus-genome',
    question: 'What is the viral genome architecture and Baltimore classification?',
    category: 'Morphology',
    educationalContext:
      'David Baltimore classified viruses into seven groups based on nucleic acid type (DNA vs RNA), strandedness (ss vs ds), and sense (+ vs -) to define their pathway of mRNA synthesis.',
    options: [
      {
        text: 'Group I: Double-Stranded DNA (dsDNA) genome in complex contractile capsid ("lunar lander")',
        explanation: 'Targets bacterial hosts (bacteriophages) with high-efficiency lytic burst.',
        candidateMicrobeIds: ['enterobacteria-phage-t4'],
      },
      {
        text: 'Group IV: Positive-Sense Single-Stranded RNA (+ssRNA) in enveloped spherical particle with surface spikes',
        explanation: 'Genome directly serves as mRNA; includes Coronaviruses.',
        candidateMicrobeIds: ['sars-cov-2'],
      },
      {
        text: 'Group V: Negative-Sense Single-Stranded RNA (-ssRNA) with segmented genome & glycoprotein spikes',
        explanation: 'Carries viral RNA-dependent RNA polymerase; segmented genome enables antigenic shift (Flu).',
        candidateMicrobeIds: ['influenza-a'],
      },
      {
        text: 'Group V: Negative-Sense Single-Stranded RNA (-ssRNA) with elongated filamentous thread-like virions',
        explanation: 'Filoviridae producing severe hemorrhagic fevers under BSL-4 containment.',
        candidateMicrobeIds: ['ebolavirus'],
      },
    ],
  },

  'node-cellular-domain': {
    id: 'node-cellular-domain',
    question: 'What is the nuclear and cellular organization?',
    category: 'Cellularity',
    educationalContext:
      'Prokaryotic cells lack a membrane-enclosed nucleus and membrane-bound organelles (70S ribosomes, circular chromosome). Eukaryotic cells contain a membrane-bound nucleus, 80S cytosolic ribosomes, mitochondria, and endomembrane systems.',
    options: [
      {
        text: 'Prokaryotic (No nuclear envelope or mitochondria; small cells ~0.5-5 µm; circular DNA in nucleoid)',
        explanation: 'Includes Bacteria and Archaea.',
        nextNodeId: 'node-prokaryote-domain',
        candidateMicrobeIds: [
          'escherichia-coli',
          'staphylococcus-aureus',
          'mycobacterium-tuberculosis',
          'bacillus-anthracis',
          'streptococcus-pneumoniae',
          'pseudomonas-aeruginosa',
          'clostridium-botulinum',
          'treponema-pallidum',
          'vibrio-cholerae',
          'halobacterium-salinarum',
          'methanobrevibacter-smithii',
        ],
      },
      {
        text: 'Eukaryotic (Membrane-bound nucleus, mitochondria, endoplasmic reticulum, larger cells ~5-200 µm)',
        explanation: 'Includes Fungi, Protozoa, and Microalgae.',
        nextNodeId: 'node-eukaryote-group',
        candidateMicrobeIds: [
          'saccharomyces-cerevisiae',
          'penicillium-chrysogenum',
          'candida-albicans',
          'plasmodium-falciparum',
          'giardia-lamblia',
          'paramecium-caudatum',
          'chlamydomonas-reinhardtii',
        ],
      },
    ],
  },

  'node-prokaryote-domain': {
    id: 'node-prokaryote-domain',
    question: 'What is the membrane lipid chemistry and cell wall structure?',
    category: 'Morphology',
    educationalContext:
      'Carl Woese established the Archaea vs Bacteria division using 16S rRNA. Archaea possess ether-linked branched isoprenoid lipids and pseudomurein/S-layers (resistant to lysozyme and penicillins), while Bacteria feature ester-linked unbranched fatty acids and peptidoglycan.',
    options: [
      {
        text: 'Bacteria (Ester-linked unbranched fatty acids; peptidoglycan cell wall present; inhibited by classical antibiotics)',
        explanation: 'True bacteria across Proteobacteria, Firmicutes, Actinobacteria, and Spirochaetes.',
        nextNodeId: 'node-bacteria-envelope',
        candidateMicrobeIds: [
          'escherichia-coli',
          'staphylococcus-aureus',
          'mycobacterium-tuberculosis',
          'bacillus-anthracis',
          'streptococcus-pneumoniae',
          'pseudomonas-aeruginosa',
          'clostridium-botulinum',
          'treponema-pallidum',
          'vibrio-cholerae',
        ],
      },
      {
        text: 'Archaea (Ether-linked branched phytanyl lipids; lacks peptidoglycan; unique extremophilic or methanogenic adaptations)',
        explanation: 'Archaea residing in hypersaline lakes, deep thermal vents, or anaerobic gut environments.',
        nextNodeId: 'node-archaea-habitat',
        candidateMicrobeIds: ['halobacterium-salinarum', 'methanobrevibacter-smithii'],
      },
    ],
  },

  'node-archaea-habitat': {
    id: 'node-archaea-habitat',
    question: 'What is the metabolic niche and environmental requirement of the archaeon?',
    category: 'Physiology',
    educationalContext:
      'Archaea occupy extreme physiological niches or essential metabolic roles in anaerobic digestion and human gut ecology.',
    options: [
      {
        text: 'Extreme Halophile (Requires >3.5 M NaCl; purple membrane with bacteriorhodopsin; photoheterotrophic)',
        explanation: 'Thrives in solar salterns and saturated salt lakes; lyses in tap water.',
        candidateMicrobeIds: ['halobacterium-salinarum'],
      },
      {
        text: 'Methanogen (Strict obligate anaerobe; reduces CO2 and H2 to methane gas CH4; pseudomurein wall)',
        explanation: 'Human gut microbiome resident that autofluoresces at 420 nm via Coenzyme F420.',
        candidateMicrobeIds: ['methanobrevibacter-smithii'],
      },
    ],
  },

  'node-bacteria-envelope': {
    id: 'node-bacteria-envelope',
    question: 'What is the cell wall staining reaction and architecture?',
    category: 'Gram Stain',
    educationalContext:
      'Christian Gram developed the Gram stain in 1884. Thick peptidoglycan retains crystal violet-iodine (Gram-positive purple). Thin peptidoglycan with an outer lipid membrane decolorizes with alcohol and takes safranin (Gram-negative pink). Waxy mycolic acids require carbolfuchsin heat staining (Acid-Fast red).',
    options: [
      {
        text: 'Gram-Positive (Thick 20-80 nm peptidoglycan mesh, teichoic acids; retains Crystal Violet -> Purple)',
        explanation: 'Firmicutes and Actinobacteria with resilient cell envelopes.',
        nextNodeId: 'node-gram-pos-shape',
        candidateMicrobeIds: ['staphylococcus-aureus', 'bacillus-anthracis', 'streptococcus-pneumoniae', 'clostridium-botulinum'],
      },
      {
        text: 'Gram-Negative (Thin 2-7 nm peptidoglycan sandwiched by outer membrane with LPS endotoxin -> Pink/Red)',
        explanation: 'Proteobacteria and Spirochaetes with complex dual-membrane envelopes.',
        nextNodeId: 'node-gram-neg-shape',
        candidateMicrobeIds: ['escherichia-coli', 'pseudomonas-aeruginosa', 'vibrio-cholerae', 'treponema-pallidum'],
      },
      {
        text: 'Acid-Fast Positive (Rich in waxy mycolic acids; resists Gram decolorization; stains bright red with carbolfuchsin)',
        explanation: 'Mycobacteria with impermeable lipid coats that resist drying and chemical disinfectants.',
        candidateMicrobeIds: ['mycobacterium-tuberculosis'],
      },
    ],
  },

  'node-gram-pos-shape': {
    id: 'node-gram-pos-shape',
    question: 'What is the cellular shape (morphology) of the Gram-positive bacterium?',
    category: 'Morphology',
    educationalContext:
      'Gram-positive bacteria divide primarily into cocci (spheres) and bacilli (rods), each branching into distinct diagnostic families.',
    options: [
      {
        text: 'Cocci (Spherical cells in clusters, pairs, or chains)',
        explanation: 'Staphylococci, Streptococci, and Enterococci.',
        nextNodeId: 'node-gram-pos-cocci-tests',
        candidateMicrobeIds: ['staphylococcus-aureus', 'streptococcus-pneumoniae'],
      },
      {
        text: 'Bacilli / Rods (Elongated cylindrical cells, often spore-forming)',
        explanation: 'Spore-forming bacilli (Bacillus and Clostridium).',
        nextNodeId: 'node-gram-pos-bacilli-oxygen',
        candidateMicrobeIds: ['bacillus-anthracis', 'clostridium-botulinum'],
      },
    ],
  },

  'node-gram-pos-cocci-tests': {
    id: 'node-gram-pos-cocci-tests',
    question: 'What is the arrangement and Catalase / Coagulase reaction?',
    category: 'Biochemical',
    educationalContext:
      'The Catalase test (effervescence in 3% H2O2) distinguishes Catalase+ Staphylococci from Catalase- Streptococci. Coagulase further pinpoints virulent S. aureus.',
    options: [
      {
        text: 'Clusters (staphylo-); Catalase POSITIVE; Coagulase POSITIVE; Golden colonies fermenting mannitol',
        explanation: 'Golden staph / MRSA producing beta-hemolysis on blood agar.',
        candidateMicrobeIds: ['staphylococcus-aureus'],
      },
      {
        text: 'Pairs / Lancet diplococci; Catalase NEGATIVE; Alpha-hemolytic (green); Optochin sensitive & Bile soluble',
        explanation: 'Pneumococcus with polysaccharide capsule causing lobar pneumonia and meningitis.',
        candidateMicrobeIds: ['streptococcus-pneumoniae'],
      },
    ],
  },

  'node-gram-pos-bacilli-oxygen': {
    id: 'node-gram-pos-bacilli-oxygen',
    question: 'What is the atmospheric oxygen requirement and spore localization?',
    category: 'Physiology',
    educationalContext:
      'Aerobic and facultative spore formers belong to the genus Bacillus, whereas obligate anaerobic spore formers belong to Clostridium.',
    options: [
      {
        text: 'Aerobic / Facultative Anaerobe; Large boxcar-shaped square-ended chains; Poly-D-glutamic capsule; Non-motile',
        explanation: 'Anthrax bacillus with central ellipsoidal spores and tripartite exotoxin.',
        candidateMicrobeIds: ['bacillus-anthracis'],
      },
      {
        text: 'Strict Obligate Anaerobe; Subterminal bulging oval endospores; Produces potent neurotoxin',
        explanation: 'Botulism organism producing flaccid paralysis via BoNT blocking acetylcholine release.',
        candidateMicrobeIds: ['clostridium-botulinum'],
      },
    ],
  },

  'node-gram-neg-shape': {
    id: 'node-gram-neg-shape',
    question: 'What is the morphological shape and motility mechanism?',
    category: 'Morphology',
    educationalContext:
      'Gram-negative bacteria display high diversity: straight bacilli, curved comma vibrios, or flexible corkscrew spirochetes with periplasmic flagella.',
    options: [
      {
        text: 'Straight Rods / Bacilli (Standard cylindrical rod shape)',
        explanation: 'Enterobacteriaceae and Pseudomonads.',
        nextNodeId: 'node-gram-neg-bacilli-tests',
        candidateMicrobeIds: ['escherichia-coli', 'pseudomonas-aeruginosa'],
      },
      {
        text: 'Curved / Comma-shaped (Vibrio) with single polar flagellum; "Shooting star" motility; Halotolerant',
        explanation: 'Cholera agent growing as yellow colonies on TCBS agar.',
        candidateMicrobeIds: ['vibrio-cholerae'],
      },
      {
        text: 'Tight Corkscrew Spirochete with periplasmic axial filaments; Invisible on standard Gram stain',
        explanation: 'Syphilis spirochete visualized via darkfield microscopy or treponemal serology.',
        candidateMicrobeIds: ['treponema-pallidum'],
      },
    ],
  },

  'node-gram-neg-bacilli-tests': {
    id: 'node-gram-neg-bacilli-tests',
    question: 'What is the Oxidase reaction, Lactose fermentation, and pigmentation?',
    category: 'Biochemical',
    educationalContext:
      'The cytochrome c oxidase test differentiates fermentative Enterobacteriaceae (oxidase negative) from non-fermentative environmental pseudomonads (oxidase positive).',
    options: [
      {
        text: 'Oxidase NEGATIVE; Lactose fermenter (Pink colonies on MacConkey agar; Green sheen on EMB); Peritrichous flagella',
        explanation: 'Escherichia coli, a coliform indicator of fecal contamination.',
        candidateMicrobeIds: ['escherichia-coli'],
      },
      {
        text: 'Oxidase POSITIVE; Non-lactose fermenter (Pale on MacConkey); Strict aerobe producing blue-green pyocyanin & sweet odor',
        explanation: 'Pseudomonas aeruginosa, opportunistic pathogen with high intrinsic multidrug resistance.',
        candidateMicrobeIds: ['pseudomonas-aeruginosa'],
      },
    ],
  },

  'node-eukaryote-group': {
    id: 'node-eukaryote-group',
    question: 'To which eukaryotic kingdom does the organism belong?',
    category: 'Cellularity',
    educationalContext:
      'Microscopic eukaryotes include saprophytic Fungi (chitinous wall), animal-like Protozoa (phagotrophic, motile, no cell wall), and photosynthetic Microalgae (chloroplasts, autotrophic).',
    options: [
      {
        text: 'Fungi (Absorptive heterotrophs with chitin and beta-glucan cell wall; ergosterol in plasma membrane)',
        explanation: 'Yeasts and molds.',
        nextNodeId: 'node-fungi-morphology',
        candidateMicrobeIds: ['saccharomyces-cerevisiae', 'penicillium-chrysogenum', 'candida-albicans'],
      },
      {
        text: 'Protozoa (Unicellular heterotrophic protists lacking cell wall; motile via flagella, cilia, or gliding)',
        explanation: 'Parasitic and free-living single-celled animals.',
        nextNodeId: 'node-protozoa-motility',
        candidateMicrobeIds: ['plasmodium-falciparum', 'giardia-lamblia', 'paramecium-caudatum'],
      },
      {
        text: 'Microalgae (Photosynthetic unicellular eukaryote with green cup-shaped chloroplast and eyespot)',
        explanation: 'Phototrophic green alga with twin apical flagella (Chlamydomonas).',
        candidateMicrobeIds: ['chlamydomonas-reinhardtii'],
      },
    ],
  },

  'node-fungi-morphology': {
    id: 'node-fungi-morphology',
    question: 'What is the growth morphology (yeast vs filamentous mold vs dimorphic)?',
    category: 'Morphology',
    educationalContext:
      'Yeasts are unicellular and reproduce by budding. Molds produce multicellular branching hyphae. Dimorphic fungi alternate between yeast and hyphal states depending on temperature and host cues.',
    options: [
      {
        text: 'Unicellular Budding Yeast; Round/ovoid cells; Non-pathogenic food/model organism',
        explanation: 'Baker/brewer yeast carrying out ethanolic fermentation.',
        candidateMicrobeIds: ['saccharomyces-cerevisiae'],
      },
      {
        text: 'Filamentous Mold; Branching septate hyphae with brush-like "penicillus" conidiophores and green conidia',
        explanation: 'Penicillium chrysogenum producing Fleming landmark antibiotic penicillin.',
        candidateMicrobeIds: ['penicillium-chrysogenum'],
      },
      {
        text: 'Dimorphic Yeast/Pseudohyphae; Forms germ tubes in serum at 37°C; Opportunistic thrush pathogen',
        explanation: 'Candida albicans, common cause of candidiasis and vulvovaginitis.',
        candidateMicrobeIds: ['candida-albicans'],
      },
    ],
  },

  'node-protozoa-motility': {
    id: 'node-protozoa-motility',
    question: 'What is the locomotion mechanism and clinical niche of the protozoan?',
    category: 'Morphology',
    educationalContext:
      'Classical protozoan classification relies on motility: Flagellates (Mastigophora), Ciliates (Ciliophora), Amoeboids (Sarcodina), and non-motile/gliding Apicomplexans (Sporozoa).',
    options: [
      {
        text: 'Apicomplexan / Intracellular Sporozoan; Ring forms & banana gametocytes in RBCs; Transmitted by Anopheles',
        explanation: 'Plasmodium falciparum, agent of lethal malignant tertian malaria.',
        candidateMicrobeIds: ['plasmodium-falciparum'],
      },
      {
        text: 'Flagellate with 8 flagella and 2 symmetrical nuclei ("face" appearance); Ventral suction disk; "Falling leaf" motility',
        explanation: 'Giardia lamblia, causing waterborne beaver fever diarrhea.',
        candidateMicrobeIds: ['giardia-lamblia'],
      },
      {
        text: 'Free-living Ciliate covered in thousands of coordinated cilia; Slipper shape; Macronucleus & oral groove',
        explanation: 'Paramecium caudatum, classic freshwater pond ciliate.',
        candidateMicrobeIds: ['paramecium-caudatum'],
      },
    ],
  },
};
