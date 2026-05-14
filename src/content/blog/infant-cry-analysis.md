---
title: '婴儿哭声多模态分析：双通道 CNN + DNN 实验'
description: '一个用 STFT 频谱图 + CNN 提特征 + DNN 分类的婴儿哭声原因识别项目，PyTorch 实现。'
pubDate: 'Apr 14 2026'
heroImage: '../../assets/blog/infant-cry-analysis.png'
---

## 项目背景

新生儿哭声是他们与世界沟通的唯一方式——饿了、困了、不舒服、需要换尿布……不同需求对应不同的哭声模式。这个项目的目标是：**用深度学习自动识别婴儿哭声背后的原因**。

属于声音事件分类（Audio Event Classification）的子问题。

## 技术栈

- **PyTorch 1.13.1** + CUDA 11.7
- **Python 3.10.15**
- 输入特征：**STFT 频谱图**（短时傅里叶变换）
- 模型结构：**双通道 CNN + DNN 融合**

## 数据处理流水线

```
原始音频 → 音频增强 → 切成 10 秒片段 → STFT 转频谱图 → 喂入模型
```

几个工程上的决定：

- **统一长度 10 秒**：不足 10 秒的会被 pad 扩充，超过 10 秒的会被切片。这样可以批量训练、避免变长输入带来的复杂度
- **STFT 转 2D 频谱图**：把声音问题转成图像分类问题，可以直接套 CNN
- **音频增强策略**：在原始数据上做时间拉伸、加噪、移频等扰动，提升泛化能力

## 模型结构

**CNN 部分**（4 个卷积层）：
- 在频谱图上提取局部时频特征（局部高频突发、能量持续时间等）
- Dropout 50% 抗过拟合（小数据集容易过拟合）

**DNN 部分**（2 个全连接层）：
- 把 CNN 提出的高维特征映射到 `n_classes` 个类别
- ReLU 激活 + CrossEntropyLoss

## 训练配置

- **优化器**：Adam，lr=1e-3，weight_decay=1e-5（轻量 L2 正则）
- **学习率调度**：CosineAnnealingLR（cosine 退火，平滑收敛）
- **早停策略**：验证集 loss 连续不降就停，防止过拟合

训练过程会绘制三条曲线：loss / accuracy / lr，以及最终的混淆矩阵——直观看出模型在哪些类别上容易混淆。

## 推理与部署

训练完保存了模型权重 + 标签编码器（`LabelEncoder`），推理时只要加载这两份就能直接对未知音频做分类。

## 反思

回头看这个项目：

- **架构选型保守但稳**：CNN+DNN 是图像分类的标准配方，迁移到音频 STFT 上很自然
- **如果重做**：会试试 Mel 频谱图 + 预训练的 wav2vec / Whisper feature extractor，单纯的 STFT + 4 层 CNN 在小数据集上表达能力有限
- **真实场景部署难**：婴儿哭声受麦克风距离、环境噪声影响极大，公开数据集和家庭实采的差距很大

[github.com/WizardHeHeJun/Multimodal-analysis-of-infant-crying](https://github.com/WizardHeHeJun/Multimodal-analysis-of-infant-crying)
