# DEAL Checklist for Deep Learning in Pathology

AI EXTENSION checklist providing reporting guidelines for studies using deep learning in computational pathology.

**Base guideline:** Varies by study type (TRIPOD+AI for prediction models, STARD for diagnostic accuracy, CONSORT for trials)

**Primary reference:** Baxi V, Edwards R, Montalto M, Saha S. Digital pathology and artificial intelligence in translational medicine and clinical practice. Mod Pathol. 2022;35(1):23-32. doi:10.1038/s41379-021-00919-2. PMID: 34611303. Citation: The DEAL (DEep Learning in pAthology) reporting guideline was developed by the computational pathology community as a domain-specific extension. PubMed PMID not available for the primary DEAL checklist document -- published in pathology/AI venues as a community consensus guideline. The reference above provides foundational context for deep learning reporting in pathology.

This checklist provides items specific to deep learning in computational pathology. Apply alongside the primary reporting guideline appropriate for the study design.

---

## Data Acquisition

### Item 1 -- Whole slide image specification

**Description:** Report the whole slide image (WSI) specifications, including scanner manufacturer, model, scanning parameters, and file format.

**What to look for in code/outputs:**
- Scanner manufacturer and model documented (Aperio, Hamamatsu, Leica, Philips)
- Scanning magnification (20x, 40x) and resolution (microns per pixel) specified
- Image file format documented (SVS, NDPI, TIFF, DICOM-WSI)
- Quality control metrics for scanned slides (focus quality, tissue detection)

### Item 2 -- Tissue preparation

**Description:** Report tissue preparation details including fixation method, section thickness, and staining protocol.

**What to look for in code/outputs:**
- Fixation method and duration documented (10% neutral buffered formalin, standard fixation time)
- Section thickness reported (typically 3-5 micrometers)
- Staining protocol documented (H&E, IHC antibody clone, concentration, incubation time)
- Special stain or immunohistochemistry panel specifications

### Item 3 -- Stain normalization

**Description:** Describe any stain normalization or color standardization methods applied to account for inter-laboratory and inter-scanner variability.

**What to look for in code/outputs:**
- Stain normalization method (Macenko, Reinhard, Vahadane) in preprocessing code
- Reference image or target color space specification
- Color augmentation applied during training as alternative or complement to normalization
- Before/after normalization quality assessment

---

## Annotation

### Item 4 -- Annotation methodology

**Description:** Describe the annotation methodology including annotation type, tools, and protocol.

**What to look for in code/outputs:**
- Annotation type specified (pixel-level, region-level, slide-level, point annotations)
- Annotation tool documented (QuPath, ASAP, Aperio ImageScope, custom tool)
- Annotation protocol or guideline document
- Annotation format and export specifications (GeoJSON, XML, mask images)

### Item 5 -- Annotator qualifications and agreement

**Description:** Report annotator qualifications, number of annotators, and inter-annotator agreement.

**What to look for in code/outputs:**
- Annotator credentials (board-certified pathologist, subspecialty, years of experience)
- Number of annotators and whether annotations were reviewed by senior pathologists
- Inter-annotator agreement metrics (Cohen's kappa, Dice coefficient, pixel-level agreement)
- Adjudication process for annotation disagreements

---

## Data Processing

### Item 6 -- Patch extraction strategy

**Description:** Describe the patch extraction strategy including patch size, overlap, magnification level, and tissue detection.

**What to look for in code/outputs:**
- Patch size (e.g., 256x256, 512x512 pixels) and corresponding physical dimensions
- Extraction magnification level and relationship to scanning magnification
- Overlap percentage or stride between patches
- Tissue detection algorithm used to exclude background and artifact regions

### Item 7 -- Magnification and resolution

**Description:** Report the magnification and resolution used for model training and inference, and whether multi-scale approaches were used.

**What to look for in code/outputs:**
- Training magnification (5x, 10x, 20x, 40x) specified in preprocessing code
- Multi-scale or multi-resolution approach documentation
- Downsampling or upsampling methods when changing resolution
- Physical resolution (microns per pixel) reported alongside magnification

### Item 8 -- Data augmentation for pathology

**Description:** Describe data augmentation strategies specific to pathology, including geometric and color augmentations.

**What to look for in code/outputs:**
- Geometric augmentations (rotation, flipping, elastic deformation) in training pipeline
- Color/stain augmentations (hue/saturation jitter, stain augmentation)
- Augmentation pipeline code with probability and magnitude parameters
- Domain-specific augmentations (random erasing, cutout, mixup for pathology)

---

## Model Architecture

### Item 9 -- Model architecture details

**Description:** Describe the model architecture, including whether it processes patches, regions, or whole slides, and the aggregation strategy.

**What to look for in code/outputs:**
- Patch-level vs. slide-level model architecture specification
- Multiple instance learning (MIL) aggregation method if used (attention-based, max-pooling)
- Feature extraction backbone (ResNet, EfficientNet, ViT) with pre-training source
- Graph neural network or spatial context modeling approaches if applicable

### Item 10 -- Pre-training and transfer learning

**Description:** Report pre-training strategy, including whether domain-specific pre-training was used.

**What to look for in code/outputs:**
- Pre-training dataset (ImageNet, pathology-specific datasets)
- Self-supervised pre-training method if applicable (contrastive learning, masked autoencoder)
- Fine-tuning strategy (full, partial, feature extraction only)
- Domain adaptation techniques if training and target domains differ

---

## Validation

### Item 11 -- External validation across scanners

**Description:** Report external validation across different scanners, laboratories, and institutions.

**What to look for in code/outputs:**
- Validation datasets from different scanners than training data
- Cross-scanner performance comparison tables
- Multi-institutional validation with site-level performance reporting
- Scanner-specific calibration or adaptation methods

### Item 12 -- Pathologist comparison

**Description:** Compare model performance against pathologist assessment, reporting inter-observer variability.

**What to look for in code/outputs:**
- Pathologist reader study with multiple readers and experience levels
- Inter-pathologist agreement metrics for context (kappa, concordance)
- AI vs. pathologist comparison on the same case set
- Blinding protocol for pathologist readings

### Item 13 -- Clinical validation

**Description:** Report clinical validation including correlation with clinical outcomes when applicable.

**What to look for in code/outputs:**
- Survival analysis correlating AI predictions with patient outcomes
- Hazard ratios or odds ratios for AI-derived biomarkers
- Multivariate analysis showing independent prognostic value
- Time-to-event analysis code with appropriate censoring

---

## Interpretability

### Item 14 -- Spatial interpretability

**Description:** Report spatial interpretability analyses showing which tissue regions drive model predictions.

**What to look for in code/outputs:**
- Attention heatmap or saliency map generation code overlaid on WSIs
- Pathologist review of model attention regions for clinical plausibility
- Correlation between high-attention regions and known morphological features
- Visualization of model decision boundaries in tissue space

### Item 15 -- Biological plausibility assessment

**Description:** Assess whether model predictions correlate with known biological mechanisms or pathological features.

**What to look for in code/outputs:**
- Correlation analysis between AI features and known biomarkers (IHC, molecular)
- Morphometric feature extraction from model-identified regions
- Gene expression or molecular pathway correlation with AI predictions
- Expert pathologist assessment of model-identified features

---

## Reproducibility

### Item 16 -- Computational reproducibility

**Description:** Report all information needed for computational reproducibility, including code, models, and preprocessing pipelines.

**What to look for in code/outputs:**
- Complete preprocessing, training, and inference code in a repository
- Model weights and architecture definition files shared
- Slide-level or patch-level data splits documented with identifiers
- Docker or container specifications for the complete computational environment
- Random seeds and hardware specifications for training reproducibility
