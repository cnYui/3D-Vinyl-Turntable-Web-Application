const fs = require('fs');
const path = require('path');

// 音频文件夹路径
const audioFolderPath = path.join(__dirname, '../public/audio');
const outputPath = path.join(__dirname, '../src/data/vinylCollection.ts');

// 支持的音频格式
const supportedFormats = ['.mp3', '.wav', '.ogg', '.m4a'];

// 颜色数组，用于随机分配唱片颜色
const colors = [
  '#8b5a2b', '#2d4a3e', '#8b2635', '#4a2c5e', '#5e4a2c',
  '#2c3e5e', '#5e2c3e', '#3e2c5e', '#2c5e4a', '#5e3e2c',
  '#4a5e2c', '#2c4a5e', '#5e4a3e', '#3e5e4a', '#4a3e5e',
  '#5e2c4a', '#3e4a5e', '#5e3e4a', '#4a5e3e', '#2c5e3e'
];

function parseFileName(fileName) {
  // 移除文件扩展名
  const nameWithoutExt = path.parse(fileName).name;
  
  // 尝试解析格式：编号-艺术家-歌曲名
  const match = nameWithoutExt.match(/^(\d+)-(.+?)-(.+)$/);
  
  if (match) {
    const [, id, artist, title] = match;
    return {
      id: id.padStart(2, '0'),
      artist: artist.replace(/_/g, ' '),
      title: title.replace(/_/g, ' ')
    };
  }
  
  // 如果格式不匹配，使用文件名作为标题
  return {
    id: Math.random().toString(36).substr(2, 9),
    artist: '未知艺术家',
    title: nameWithoutExt.replace(/_/g, ' ')
  };
}

function generateVinylCollection() {
  try {
    // 检查音频文件夹是否存在
    if (!fs.existsSync(audioFolderPath)) {
      console.log('音频文件夹不存在，创建中...');
      fs.mkdirSync(audioFolderPath, { recursive: true });
    }

    // 读取音频文件夹中的文件
    const files = fs.readdirSync(audioFolderPath);
    
    // 过滤出音频文件
    const audioFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return supportedFormats.includes(ext);
    });

    if (audioFiles.length === 0) {
      console.log('在 public/audio/ 文件夹中没有找到音频文件');
      console.log('请将您的音频文件放入该文件夹，建议命名格式：01-艺术家-歌曲名.mp3');
      return;
    }

    // 生成唱片数据
    const vinylRecords = audioFiles.map((file, index) => {
      const parsed = parseFileName(file);
      const colorIndex = index % colors.length;
      
      return {
        id: parsed.id,
        title: parsed.title,
        artist: parsed.artist,
        cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
        color: colors[colorIndex],
        audioUrl: `/audio/${file}`,
        duration: 200 + Math.floor(Math.random() * 200) // 随机时长，实际使用时会被音频文件的真实时长覆盖
      };
    });

    // 生成 TypeScript 文件内容
    const tsContent = `// 黑胶唱片集合数据 - 自动生成
// 运行 node scripts/generateVinylCollection.js 来重新生成此文件

export interface VinylRecord {
  id: string;
  title: string;
  artist: string;
  cover: string;
  color: string;
  audioUrl: string;
  duration: number;
}

// 唱片集合
export const VINYL_COLLECTION: VinylRecord[] = ${JSON.stringify(vinylRecords, null, 2)};
`;

    // 写入文件
    fs.writeFileSync(outputPath, tsContent, 'utf8');
    
    console.log(`✅ 成功生成 ${vinylRecords.length} 张唱片的数据`);
    console.log('📁 文件保存至:', outputPath);
    console.log('\n🎵 发现的音频文件:');
    vinylRecords.forEach(record => {
      console.log(`  - ${record.artist} - ${record.title}`);
    });
    
  } catch (error) {
    console.error('❌ 生成失败:', error.message);
  }
}

// 运行生成器
generateVinylCollection();