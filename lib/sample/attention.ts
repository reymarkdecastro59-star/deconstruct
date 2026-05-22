import type { PaperAnalysis } from "@/lib/schemas/analysis";

export const ATTENTION_SAMPLE: PaperAnalysis = {
  id: "00000000-0000-0000-0000-000000000001",
  title: "Attention Is All You Need",
  field: "Natural Language Processing / Deep Learning",
  createdAt: "2017-06-12T00:00:00.000Z",

  plainAbstract:
    "Before this paper, the best sequence-to-sequence models for tasks like machine translation relied on recurrent or convolutional neural networks as their backbone, often augmented with an attention mechanism. The authors proposed the Transformer, an architecture that discards recurrence and convolutions entirely and is built solely on multi-head self-attention. Trained on standard WMT benchmarks, the Transformer reached a new state of the art of 28.4 BLEU on English-to-German and 41.0 BLEU on English-to-French translation. Crucially, this quality was achieved in a fraction of the time: the large model required only 3.5 days of training on 8 NVIDIA P100 GPUs. The design also generalises beyond translation, yielding strong results on English constituency parsing.",

  contributions: [
    "Introduced the Transformer, the first sequence transduction model based entirely on attention, eliminating recurrence and convolutions.",
    "Proposed multi-head attention, which allows the model to jointly attend to information from different representation subspaces at different positions.",
    "Designed scaled dot-product attention with a scaling factor of 1/√d_k to counteract vanishing gradients in high-dimensional dot products.",
    "Introduced sinusoidal positional encodings to inject sequence order information without learnable parameters.",
    "Demonstrated that self-attention layers connect all positions in O(1) sequential operations, versus O(n) for recurrent layers.",
    "Achieved state-of-the-art BLEU scores (28.4 EN→DE, 41.0 EN→FR) while reducing training cost by orders of magnitude compared to prior work.",
    "Showed the architecture generalises to English constituency parsing with minimal task-specific tuning.",
  ],

  methodology:
    "The Transformer uses an encoder-decoder structure, each composed of N=6 identical layers. Every encoder layer has two sub-layers: a multi-head self-attention mechanism and a position-wise feed-forward network. Every decoder layer adds a third sub-layer: multi-head attention over the encoder output. Residual connections followed by layer normalisation wrap each sub-layer. The model dimension is d_model=512. Multi-head attention uses h=8 parallel attention heads with d_k=d_v=64 dimensions each, so the concatenated output remains 512-dimensional. The feed-forward sub-layers have an inner dimension of d_ff=2,048. Scaled dot-product attention computes scores as softmax(QKᵀ/√d_k)V. Positional information is injected via fixed sinusoidal encodings added to the input embeddings. The big model (used for the best results) doubles d_model to 1,024, increases heads to 16, and applies dropout of 0.3. Training used the Adam optimiser with a custom learning-rate schedule (warm-up for 4,000 steps then decay), label smoothing of ε=0.1, and byte-pair encoding vocabularies. The EN→DE corpus contains 4.5M sentence pairs; the EN→FR corpus contains 36M sentence pairs.",

  findings:
    "The Transformer (big) achieved 28.4 BLEU on WMT 2014 English-to-German, surpassing the previous best ensemble by more than 2 BLEU points. On WMT 2014 English-to-French it reached 41.0 BLEU, outperforming all prior single models and using less than 1/4 of the training FLOPs of the next-best model. The base model (d_model=512, 6 layers) alone scored 27.3 BLEU on EN→DE. Training the big model took 3.5 days on 8 NVIDIA P100 GPUs (300,000 steps); the base model took 100,000 steps (~12 hours). Ablation studies confirmed that reducing heads, reducing d_k, or removing positional encodings all degraded EN→DE BLEU by 0.5–1.8 points. On Penn Treebank English constituency parsing the Transformer achieved an F1 of 91.3 with only 40K training sentences, competitive with task-specific recurrent parsers.",

  limitations: [
    "Self-attention has O(n²·d) memory and compute complexity per layer, making it expensive for very long sequences (e.g., character-level models or long documents).",
    "The model requires fixed-length positional encodings; generalisation to sequence lengths unseen during training is not guaranteed.",
    "All positions are processed in parallel, so the model cannot inherently exploit left-to-right causal structure without explicit masking, complicating streaming or incremental inference.",
    "Evaluation is limited to machine translation and one parsing benchmark; behaviour on diverse low-resource or structured-prediction tasks is not studied.",
    "The training corpus sizes (4.5M and 36M pairs) are large; performance in genuine low-resource settings is not characterised.",
    "Hyperparameter sensitivity (warm-up steps, label smoothing, dropout rate) is noted but not fully explained theoretically.",
  ],

  futureWork:
    "The authors planned to apply the Transformer to other tasks involving images, audio, and video by extending attention to handle local, restricted neighbourhoods for large inputs. They also intended to investigate making generation less sequential to improve decoding efficiency, and to explore learned or relative positional representations as alternatives to the fixed sinusoidal scheme.",

  keywords: [
    "transformer",
    "self-attention",
    "multi-head attention",
    "sequence-to-sequence",
    "machine translation",
    "neural machine translation",
    "positional encoding",
    "encoder-decoder",
    "BLEU score",
    "attention mechanism",
  ],

  sections: [
    {
      title: "Introduction",
      summary:
        "The authors motivate the Transformer by identifying the fundamental limitation of recurrent models: sequential computation prevents parallelisation during training and creates long dependency paths between distant positions. They position attention mechanisms — already used as an add-on in RNN systems — as a sufficient replacement for recurrence.",
      keyPoints: [
        "Recurrent language models process tokens one step at a time, preventing parallelism and creating O(n) dependency paths.",
        "Attention mechanisms have been used alongside RNNs but never as the sole architectural primitive.",
        "The Transformer is introduced as the first model relying entirely on attention to compute input and output representations.",
        "The new architecture achieves superior quality with dramatically lower training time than RNN baselines.",
      ],
    },
    {
      title: "Background",
      summary:
        "Prior work using convolutional architectures (ByteNet, ConvS2S) is reviewed. While convolutions enable parallelism, they require O(log n) or O(n) layers to relate distant positions. The section formally defines self-attention and distinguishes it from cross-attention, and reviews multi-step memory networks.",
      keyPoints: [
        "Convolutional sequence models reduce sequential operations but increase the number of layers needed to capture long-range dependencies.",
        "Self-attention relates different positions of a single sequence to compute its representation.",
        "The Transformer is the first transduction model using self-attention without any recurrence or convolution.",
        "End-to-end memory networks based on recurrent attention have shown promise on simple language tasks.",
      ],
    },
    {
      title: "Model Architecture",
      summary:
        "The full Transformer architecture is described: a 6-layer encoder and 6-layer decoder, each with multi-head self-attention and position-wise feed-forward sub-layers wrapped in residual connections and layer normalisation. Scaled dot-product attention and multi-head attention are derived mathematically. Positional encodings using sin and cos functions of different frequencies are explained.",
      keyPoints: [
        "Encoder: 6 layers, each with multi-head self-attention (h=8, d_k=d_v=64) and a feed-forward network (d_ff=2048), plus residual connections and LayerNorm.",
        "Decoder: same 6-layer structure but adds a masked self-attention sub-layer and cross-attention over encoder output.",
        "Scaled dot-product attention divides logits by √d_k=8 before softmax to prevent saturation in high dimensions.",
        "Multi-head attention projects queries, keys, and values h=8 times into d_k=64-dimensional spaces, runs attention in parallel, then concatenates and projects the results.",
        "Position-wise feed-forward networks apply two linear transformations with a ReLU in between: FFN(x) = max(0, xW₁+b₁)W₂+b₂.",
        "Sinusoidal positional encodings PE(pos,2i)=sin(pos/10000^(2i/d_model)) are added to input embeddings to encode absolute position.",
      ],
    },
    {
      title: "Why Self-Attention",
      summary:
        "A theoretical comparison of self-attention, recurrent, and convolutional layers across three criteria: total computational complexity per layer, degree of parallelisable operations, and the maximum path length between arbitrary pairs of positions in the input and output sequences.",
      keyPoints: [
        "Self-attention: O(n²·d) complexity, O(1) sequential operations, O(1) maximum path length — ideal for learning long-range dependencies.",
        "Recurrent layers: O(n·d²) complexity, O(n) sequential operations, O(n) maximum path length.",
        "Convolutional layers (kernel size k): O(k·n·d²) complexity, O(1) sequential operations, O(log_k(n)) maximum path length.",
        "For typical sequence lengths (n<d), self-attention is faster than recurrence per layer.",
        "The authors also argue that self-attention produces more interpretable representations, visualising attention heads specialising in syntax and coreference.",
      ],
    },
    {
      title: "Training",
      summary:
        "Training details for all experiments: datasets, hardware, optimiser schedule, regularisation strategy, and the label-smoothing technique used to improve BLEU despite hurting perplexity.",
      keyPoints: [
        "EN→DE: WMT 2014, 4.5M sentence pairs, byte-pair encoding with shared 37K-token vocabulary.",
        "EN→FR: WMT 2014, 36M sentence pairs, 32K word-piece vocabulary.",
        "Hardware: 8 NVIDIA P100 GPUs; base model trained for 100K steps (~12 hours), big model for 300K steps (3.5 days).",
        "Adam optimiser with β₁=0.9, β₂=0.98, ε=10⁻⁹ and a warm-up learning rate schedule (lrate ∝ d_model^{-0.5} · min(step^{-0.5}, step · warmup_steps^{-1.5}), warmup_steps=4000).",
        "Regularisation: residual dropout (P_drop=0.1 for base, 0.3 for big) and label smoothing ε_ls=0.1.",
      ],
    },
    {
      title: "Results",
      summary:
        "Quantitative results on WMT 2014 EN→DE and EN→FR translation benchmarks plus an English constituency parsing experiment on WSJ Penn Treebank, including ablation studies over model components.",
      keyPoints: [
        "Transformer (big): 28.4 BLEU on EN→DE — more than 2 points above the previous best ensemble, at 1/8 the training cost.",
        "Transformer (big): 41.0 BLEU on EN→FR — new single-model state of the art, using less than 1/4 the training FLOPs of the prior best.",
        "Base model: 27.3 BLEU EN→DE, already beating all previously published single models.",
        "Ablation: reducing heads from 8 to 1 drops EN→DE BLEU by 0.9; reducing d_k from 64 to 16 drops it by 1.1; removing positional encodings drops it by 1.8.",
        "English constituency parsing (WSJ): F1=91.3 with only 40K training sentences, competitive with supervised recurrent parsers trained on the same data.",
      ],
    },
    {
      title: "Conclusion",
      summary:
        "The paper summarises the Transformer's key novelty, reiterates the benchmark results, and outlines planned extensions to non-sequential modalities.",
      keyPoints: [
        "The Transformer is the first sequence transduction model based entirely on attention, replacing recurrence and convolutions.",
        "It achieves new state-of-the-art results on EN→DE (28.4) and EN→FR (41.0) while being significantly faster to train.",
        "The authors plan to extend the approach to images, audio, and video and to investigate restricted attention for large inputs.",
        "Code was made available at https://github.com/tensorflow/tensor2tensor.",
      ],
    },
  ],

  concepts: [
    {
      id: "transformer",
      type: "core",
      description:
        "The Transformer is the model introduced in the paper: an encoder-decoder architecture composed entirely of attention mechanisms and feed-forward layers, with no recurrence or convolution. The base configuration uses d_model=512, 6 layers, h=8 heads.",
    },
    {
      id: "self-attention",
      type: "method",
      description:
        "An attention mechanism that relates each position in a sequence to every other position within the same sequence to compute a new representation. In the Transformer it is the primary information-mixing operation, enabling O(1) maximum dependency path length.",
    },
    {
      id: "multi-head-attention",
      type: "method",
      description:
        "An extension of attention that runs h=8 attention functions in parallel on d_k=64-dimensional projections of queries, keys, and values, then concatenates and linearly projects the results. This allows the model to attend to different representation subspaces simultaneously.",
    },
    {
      id: "scaled-dot-product-attention",
      type: "method",
      description:
        "The specific attention function used in the Transformer: softmax(QKᵀ/√d_k)V. The division by √d_k=8 prevents the dot products from growing large and causing gradient saturation in the softmax.",
    },
    {
      id: "positional-encoding",
      type: "method",
      description:
        "Fixed sinusoidal encodings added to token embeddings to inject absolute position information. PE(pos,2i)=sin(pos/10000^(2i/d_model)) and PE(pos,2i+1)=cos(pos/10000^(2i/d_model)). No learnable parameters are introduced.",
    },
    {
      id: "encoder-decoder",
      type: "core",
      description:
        "The overall architectural pattern of the Transformer: a 6-layer encoder that maps an input sequence to continuous representations, and a 6-layer decoder that autoregressively generates an output sequence while attending to those encoder representations.",
    },
    {
      id: "feed-forward-network",
      type: "method",
      description:
        "Position-wise fully connected sub-layers in each encoder and decoder layer. Applied identically and independently to each position: FFN(x)=max(0,xW₁+b₁)W₂+b₂ with inner dimension d_ff=2,048 and output dimension d_model=512.",
    },
    {
      id: "residual-connection",
      type: "method",
      description:
        "Skip connections applied around every sub-layer in the Transformer (both attention and feed-forward), followed by layer normalisation: output = LayerNorm(x + Sublayer(x)). They facilitate gradient flow during training of deep networks.",
    },
    {
      id: "bleu-en-de",
      type: "result",
      description:
        "The Transformer (big) achieved 28.4 BLEU on the WMT 2014 English-to-German translation benchmark, exceeding the previous best ensemble model by more than 2 BLEU points. The base model alone scored 27.3 BLEU.",
    },
    {
      id: "bleu-en-fr",
      type: "result",
      description:
        "The Transformer (big) achieved 41.0 BLEU on the WMT 2014 English-to-French translation benchmark, a new single-model state of the art, while using less than one quarter of the training FLOPs of the previous best model.",
    },
    {
      id: "training-efficiency",
      type: "finding",
      description:
        "The big Transformer model was trained on 8 NVIDIA P100 GPUs for 3.5 days (300,000 steps). This is orders of magnitude less compute than prior state-of-the-art recurrent and convolutional models while achieving higher BLEU scores.",
    },
    {
      id: "label-smoothing",
      type: "method",
      description:
        "A regularisation technique applied during training with ε_ls=0.1, which spreads a small probability mass across all vocabulary items instead of assigning full probability to the correct token. It hurts perplexity but improves BLEU and accuracy.",
    },
  ],

  relationships: [
    {
      source: "transformer",
      target: "encoder-decoder",
      label: "implements",
    },
    {
      source: "transformer",
      target: "multi-head-attention",
      label: "is built entirely from",
    },
    {
      source: "multi-head-attention",
      target: "scaled-dot-product-attention",
      label: "runs h=8 parallel instances of",
    },
    {
      source: "multi-head-attention",
      target: "self-attention",
      label: "realises",
    },
    {
      source: "encoder-decoder",
      target: "feed-forward-network",
      label: "contains in every layer",
    },
    {
      source: "encoder-decoder",
      target: "residual-connection",
      label: "wraps every sub-layer with",
    },
    {
      source: "encoder-decoder",
      target: "positional-encoding",
      label: "requires to encode sequence order",
    },
    {
      source: "transformer",
      target: "bleu-en-de",
      label: "achieves 28.4 BLEU on",
    },
    {
      source: "transformer",
      target: "bleu-en-fr",
      label: "achieves 41.0 BLEU on",
    },
    {
      source: "transformer",
      target: "training-efficiency",
      label: "demonstrates",
    },
    {
      source: "label-smoothing",
      target: "bleu-en-de",
      label: "contributes to improved",
    },
    {
      source: "scaled-dot-product-attention",
      target: "self-attention",
      label: "is the computational core of",
    },
  ],
};
