import { PaperData } from '../types';
import { PRESET_CALCULATIONS } from '../utils/calcEngine';

export const BLANK_PAPER_DATA: PaperData = {
  title: '',
  author: '',
  affiliation: '',
  studentId: '',
  email: '',
  publicationTag: 'IEEE Academic Project Report & Documentation',
  date: 'September 2026',
  keywords: '',
  abstract: '',
  keyModules: '',
  modulesList: [],
  boundResearch: [],
  equations: [],
  graph: {
    enabled: false,
    title: '',
    xAxisLabel: '',
    yAxisLabel: '',
    caption: '',
    chartType: 'line',
    inputMode: 'preset',
    valuesInput: '',
    formulaInput: '',
    presetKey: 'throughput_tps',
    color: '#d97706',
    data: [],
  },
  acknowledgments: '',
};

export const STUDENT_TEMPLATES: Record<string, { label: string; icon: string; data: PaperData }> = {
  blank: {
    label: 'Blank Academic Report',
    icon: 'FileText',
    data: BLANK_PAPER_DATA,
  },
  ai_deeplearning: {
    label: 'AI & Neural Networks',
    icon: 'Brain',
    data: {
      title: 'Optimization and Convergence Analysis of Lightweight Convolutional Neural Networks for Edge Vision',
      author: 'Maya Lin & Jordan Rivera',
      affiliation: 'Department of Electrical & Computer Engineering, Polytechnic University',
      studentId: 'POLY-2026-4412',
      email: 'm.lin@polytechnic.edu',
      publicationTag: 'IEEE International Student Symposium on Machine Learning & Computer Vision',
      date: 'September 2026',
      keywords: 'Convolutional Neural Networks, Edge AI, Quantization, Cross-Entropy Loss, Gradient Descent',
      abstract:
        'Edge deployment of deep neural networks requires strict co-design between computational throughput and model memory footprint. This paper presents an 8-bit quantized convolutional network tailored for real-time edge classification. We analyze cross-entropy loss convergence across 100 optimization epochs and demonstrate a 4.2x latency reduction with less than 0.8% drop in top-1 accuracy relative to full-precision baselines.',
      keyModules:
        'Input Data Preprocessing Pipeline (OpenCV, Bilinear Scaling)\nFeature Extraction Backbone (Depthwise Separable Convolutions)\nPost-Training Int8 Quantization Engine (ONNX Runtime)\nEmbedded Inference Hardware (ARM Cortex-M55 / Ethos NPU)\nValidation & Telemetry Profiler (TensorBoard Logging)',
      modulesList: [
        {
          name: 'Quantized Convolution Engine',
          description: 'Implements int8 vector arithmetic utilizing ARM CMSIS-NN kernels.',
          tech: 'C++20 / CMSIS-NN / SIMD',
        },
        {
          name: 'Inference Runtime Harness',
          description: 'Orchestrates camera frame captures and zero-copy tensor buffers.',
          tech: 'TensorFlow Lite Micro / FreeRTOS',
        },
      ],
      boundResearch: [
        {
          id: 'wiki_cnn',
          title: 'Convolutional neural network',
          snippet:
            'In deep learning, a convolutional neural network (CNN or ConvNet) is a class of artificial neural network most commonly applied to analyze visual imagery. They use a mathematical operation called convolution in place of general matrix multiplication in at least one of their layers.',
          url: 'https://en.wikipedia.org/wiki/Convolutional_neural_network',
          pageId: 44218684,
          addedAt: '2026-09-10T09:00:00Z',
          citationKey: '[1]',
        },
        {
          id: 'wiki_gradient_descent',
          title: 'Gradient descent',
          snippet:
            'Gradient descent is a first-order iterative optimization algorithm for finding a local minimum of a differentiable function. The idea is to take repeated steps in the opposite direction of the gradient of the function at the current point.',
          url: 'https://en.wikipedia.org/wiki/Gradient_descent',
          pageId: 12040,
          addedAt: '2026-09-10T09:05:00Z',
          citationKey: '[2]',
        },
      ],
      equations: [
        {
          id: 'eq_ce_loss',
          equationNumber: 1,
          label: 'Categorical Cross-Entropy Loss',
          latex: '\\mathcal{L}_{\\text{CE}} = -\\frac{1}{N}\\sum_{i=1}^{N}\\sum_{c=1}^{C} y_{i,c} \\ln(\\hat{y}_{i,c})',
          explanation:
            'Where N denotes mini-batch size, C is class cardinality, y_{i,c} is the binary ground-truth label, and \\hat{y}_{i,c} represents predicted softmax probability.',
        },
        {
          id: 'eq_sgd_update',
          equationNumber: 2,
          label: 'SGD Parameter Optimization Vector',
          latex: '\\mathbf{w}_{t+1} = \\mathbf{w}_t - \\eta \\nabla_{\\mathbf{w}} \\mathcal{L}(\\mathbf{w}_t)',
          explanation:
            'Where \\mathbf{w}_t represents the network weight tensor at optimization step t, and \\eta denotes scheduled learning rate.',
        },
      ],
      graph: {
        enabled: true,
        title: 'Training Convergence Loss Across Optimization Epochs',
        xAxisLabel: 'Epochs',
        yAxisLabel: 'Cross-Entropy Loss',
        caption:
          'Figure 1: Stochastic gradient descent convergence rate verifying mathematical stability across 100 training epochs.',
        chartType: 'line',
        inputMode: 'preset',
        valuesInput: '0: 2.85\n10: 1.62\n20: 0.94\n30: 0.58\n50: 0.32\n75: 0.18\n100: 0.11',
        formulaInput: 'y = 2.8 * exp(-0.035 * x) + 0.1',
        presetKey: 'training_loss',
        color: '#059669',
        data: PRESET_CALCULATIONS.training_loss.data,
      },
      acknowledgments:
        'Research supported by the Academic High-Performance Computing Cluster and the Open Access Knowledge Foundation.',
    },
  },
  iot_hardware: {
    label: 'IoT & Embedded Systems',
    icon: 'Cpu',
    data: {
      title: 'Power-Efficient Environmental Telemetry Network using LoRaWAN and Mesh Relaying',
      author: 'Kaelen Vance & Sarah Jenkins',
      affiliation: 'School of Embedded Systems Engineering, Metro State College',
      studentId: 'MSC-2026-1930',
      email: 'k.vance@metrostate.edu',
      publicationTag: 'IEEE Student Conference on Internet of Things & Sensor Systems',
      date: 'September 2026',
      keywords: 'LoRaWAN, Wireless Sensor Networks, Ultra-Low Power, Environmental Telemetry, Time-Synchronized Mesh',
      abstract:
        'Environmental sensing across rural ecosystems demands resilient, battery-powered telemetry nodes capable of sustained operation over multi-year periods. This paper investigates a low-power LoRaWAN sensor network coupled with adaptive sleep scheduling. We evaluate throughput and energy consumption profiles across diverse transmission payload sizes, confirming sub-milliwatt duty cycles under 15-minute polling intervals.',
      keyModules:
        'Sensing Subsystem (BME680 Temperature/Humidity/Gas)\nMicrocontroller Host (ESP32-S3 Ultra-Low-Power Co-processor)\nLong-Range Radio Transceiver (SX1262 LoRa 915MHz)\nEnergy Harvesting Unit (Monocrystalline Solar + LiFePO4)\nCloud Ingestion Gateway (MQTT / InfluxDB / Grafana)',
      modulesList: [
        {
          name: 'Telemetry Transceiver Module',
          description: 'Schedules uplink frames with adaptive data rate (ADR) algorithm.',
          tech: 'Embedded C / LoRaWAN MAC v1.0.4',
        },
        {
          name: 'Power Management Circuitry',
          description: 'Monitors battery state of charge and governs deep-sleep power gates.',
          tech: 'Hardware PMIC / I2C Coulomb Counter',
        },
      ],
      boundResearch: [
        {
          id: 'wiki_lorawan',
          title: 'LoRa',
          snippet:
            'LoRa (from "long range") is a proprietary low-power wide-area network modulation technique. It is based on spread-spectrum modulation techniques derived from chirp spread spectrum (CSS) technology.',
          url: 'https://en.wikipedia.org/wiki/LoRa',
          pageId: 46271922,
          addedAt: '2026-09-10T09:00:00Z',
          citationKey: '[1]',
        },
        {
          id: 'wiki_sensor_network',
          title: 'Wireless sensor network',
          snippet:
            'Wireless sensor networks (WSNs) refer to a group of spatially dispersed and dedicated sensors for monitoring and recording the physical conditions of the environment and organizing the collected data at a central location.',
          url: 'https://en.wikipedia.org/wiki/Wireless_sensor_network',
          pageId: 33796,
          addedAt: '2026-09-10T09:05:00Z',
          citationKey: '[2]',
        },
      ],
      equations: [
        {
          id: 'eq_path_loss',
          equationNumber: 1,
          label: 'Free-Space Path Loss (LoRa Propagation)',
          latex: '\\text{FSPL} = 20\\log_{10}(d) + 20\\log_{10}(f) - 147.55',
          explanation:
            'Where d represents propagation distance in meters and f denotes carrier radio frequency in Hertz.',
        },
        {
          id: 'eq_energy_joules',
          equationNumber: 2,
          label: 'Active Energy Consumption per Transmission',
          latex: 'E_{\\text{tx}} = V_{\\text{dd}} \\times I_{\\text{tx}} \\times T_{\\text{air}}',
          explanation:
            'Where V_{\\text{dd}} is supply voltage, I_{\\text{tx}} is transceiver current draw, and T_{\\text{air}} represents packet time-on-air.',
        },
      ],
      graph: {
        enabled: true,
        title: 'Transaction Throughput (TPS) vs Gas Efficiency',
        xAxisLabel: 'Block Size (KB)',
        yAxisLabel: 'Throughput (Transactions/sec)',
        caption:
          'Figure 1: Empirical throughput curve validating pipelined transmission verification across increasing packet sizes.',
        chartType: 'area',
        inputMode: 'preset',
        valuesInput: '128: 120\n256: 260\n512: 530\n1024: 890\n2048: 1420\n4096: 1850',
        formulaInput: 'y = 150 * sqrt(x)',
        presetKey: 'hashrate_energy',
        color: '#0284c7',
        data: PRESET_CALCULATIONS.hashrate_energy.data,
      },
      acknowledgments:
        'This research was facilitated by the Metro State Embedded Hardware Labs.',
    },
  },
  blank_starter: {
    label: 'Blank Student Template',
    icon: 'FileText',
    data: {
      title: 'Comparative Analysis of System Performance and Computational Efficiency',
      author: 'Student Researcher Name',
      affiliation: 'Department of Computer Engineering, University Name',
      studentId: 'STU-2026-0001',
      email: 'student@university.edu',
      publicationTag: 'IEEE Student Academic Capstone & Project Documentation',
      date: 'September 2026',
      keywords: 'System Architecture, Empirical Evaluation, Proof-of-Work, Benchmarks',
      abstract:
        'Enter your research abstract here. State the principal problem or project goal, the methodology and technologies implemented, and the measured experimental outcomes.',
      keyModules:
        'Core Logic Module (Programming Language / Framework)\nData Persistence & Storage Layer (Database / Cache)\nNetwork & API Communication Subsystem (Protocols)\nUser Interface & Visualization Layer',
      modulesList: [],
      boundResearch: [],
      equations: [
        {
          id: 'eq_generic',
          equationNumber: 1,
          label: 'Governing Empirical Form',
          latex: 'y(t) = \\sum_{k=1}^{n} a_k x(t - k) + \\epsilon(t)',
          explanation:
            'Where a_k denotes deterministic model weights and \\epsilon(t) models experimental variance.',
        },
      ],
      graph: {
        enabled: true,
        title: 'Measured Execution Time (ms) vs Workload Scale',
        xAxisLabel: 'Input Size (N)',
        yAxisLabel: 'Execution Time (ms)',
        caption: 'Figure 1: Measured benchmark performance across increasing workload scales.',
        chartType: 'line',
        inputMode: 'values',
        valuesInput: '10: 15\n20: 32\n30: 58\n40: 95\n50: 140',
        formulaInput: 'y = 1.2 * x + 5',
        presetKey: 'bft_latency',
        color: '#d97706',
        data: [
          { x: '10', y: 15 },
          { x: '20', y: 32 },
          { x: '30', y: 58 },
          { x: '40', y: 95 },
          { x: '50', y: 140 },
        ],
      },
      acknowledgments: 'Documentation compiled with Vaelenor Academic Builder.',
    },
  },
};

export const INITIAL_PAPER_DATA: PaperData = BLANK_PAPER_DATA;
