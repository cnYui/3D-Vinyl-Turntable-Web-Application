# 音频文件存放说明

## 文件夹用途
这个文件夹用于存放您的音乐文件。请将您的音频文件（如 .mp3, .wav, .ogg 等格式）放在这里。

## 文件命名建议
为了便于管理，建议按以下格式命名您的音频文件：
- `01-Queen-Bohemian_Rhapsody.mp3`
- `02-Led_Zeppelin-Stairway_to_Heaven.mp3`
- `03-Eagles-Hotel_California.mp3`

## 支持的音频格式
- MP3 (.mp3)
- WAV (.wav)
- OGG (.ogg)
- M4A (.m4a)

## 使用方法
1. 将您的音频文件复制到这个文件夹中
2. 修改 `src/data/vinylCollection.ts` 文件中的 `audioUrl` 字段
3. 将 `audioUrl` 改为 `/audio/您的文件名.mp3` 格式

## 示例
```typescript
{
  id: '1',
  title: 'Bohemian Rhapsody',
  artist: 'Queen',
  audioUrl: '/audio/01-Queen-Bohemian_Rhapsody.mp3', // 指向您的本地文件
  // ... 其他属性
}
```

## 注意事项
- 确保文件名中没有特殊字符或空格（用下划线 _ 或连字符 - 替代）
- 文件大小建议不超过 10MB 以确保加载速度
- 确保您拥有这些音频文件的使用权限