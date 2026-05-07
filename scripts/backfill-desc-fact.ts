import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const translations = [
  {
    id: "cmotj4gm10001tr9g0hd19lba",
    descriptionOptions: { en: "A big, green space with grass and flowers, near a big tree and mountains.", id: "Ruang hijau besar dengan rumput dan bunga, dekat pohon besar dan gunung-gunung.", zh: "一片绿色的大草地，有青草和鲜花，靠近大树和山脉。" },
    funFactOptions: { en: "Fields are where farmers grow yummy vegetables and fruits for us to eat!", id: "Ladang adalah tempat petani menanam sayuran dan buah-buahan yang enak untuk kita makan!", zh: "田野是农民种植美味蔬菜和水果的地方，供我们食用！" }
  },
  {
    id: "cmotl926p0001trvcaiawutt6",
    descriptionOptions: { en: "A board with many boxes that have numbers inside. It's like a game to move numbe", id: "Sebuah papan dengan banyak kotak berisi angka. Ini seperti permainan untuk memindahkan angka.", zh: "一个有许多数字框的板子。就像是一个移动数字的游戏。" },
    funFactOptions: { en: "This is a tricky puzzle game called the 15-puzzle! It's been around for over 150", id: "Ini adalah permainan teka-teki sulit yang sudah ada selama lebih dari 150 tahun!", zh: "这是一个有着150多年历史的棘手拼图游戏！" }
  },
  {
    id: "cmotp08c70001trp8p4fabi7v",
    descriptionOptions: { en: "A tiny, round thing with a little eye that grows into a plant or tree.", id: "Benda kecil berbentuk bulat dengan mata kecil yang bisa tumbuh menjadi tanaman atau pohon.", zh: "一个小小的圆形东西，有一只小眼睛，能长成植物或树。" },
    funFactOptions: { en: "Seeds can travel far by wind or animals and find new places to grow!", id: "Biji bisa berpelayaran jauh lewat angin atau hewan dan menemukan tempat baru untuk tumbuh!", zh: "种子可以随风或动物传播到很远的地方，找到新的生长地点！" }
  },
  {
    id: "cmotqefk8000htrlsyhmqft47",
    descriptionOptions: { en: "A piece of paper with writing about computer viruses and math. It asks a questio", id: "Selembar kertas berisi tulisan tentang virus komputer dan matematika. Ada pertanyaan di dalamnya.", zh: "一张写着计算机病毒和数学问题的纸。上面有一个问题。" },
    funFactOptions: { en: "Did you know this math problem is about how likely a computer gets a virus from", id: "Tahu kah kamu? Soal matematika ini tentang seberapa mungkin komputer terkena virus!", zh: "你知道吗？这道数学题是关于计算机感染病毒的可能性！" }
  },
  {
    id: "cmotr1eix0001trow581q3ihq",
    descriptionOptions: { en: "A big, shiny, sparkling ghost-like thing with words on it.", id: "Benda besar yang berkilau seperti hantu, dengan kata-kata di atasnya.", zh: "一个巨大、闪亮如幽灵的东西，上面写着字。" },
    funFactOptions: { en: "Phantoms are like friendly ghosts that sparkle and shine!", id: "Hantu adalah seperti hantu yang ramah, mereka berkilau dan bersinar!", zh: "幻影就像友好的幽灵，会闪闪发光！" }
  },
  {
    id: "cmotsj3if0001tr9kzola0il8",
    descriptionOptions: { en: "This is a computer screen showing what someone typed to make a program work. It", id: "Layar komputer yang menunjukkan apa yang diketik seseorang agar program bisa bekerja.", zh: "电脑屏幕上显示着人们输入的内容，让程序运行。" },
    funFactOptions: { en: "You can make a computer dance or sing just by typing special words!", id: "Kamu bisa membuat komputer menari atau menyanyi hanya dengan mengetik kata-kata khusus!", zh: "你只需要输入特殊的词语，就能让计算机跳舞或唱歌！" }
  },
  {
    id: "cmotssfeq0001trbo1z7bivz1",
    descriptionOptions: { en: "A stack is like a stack of toys where you can only take the top one first. It's", id: "Stack adalah seperti tumpukan mainan di mana kamu hanya bisa mengambil yang paling atas dulu.", zh: "栈就像一堆玩具，你只能先拿最上面的那个。" },
    funFactOptions: { en: "Stacks are like a reverse line at a park - the last one you went in comes out fi", id: "Stacks seperti antrean terbalik di taman — yang terakhir masuk akan keluar pertama!", zh: "栈就像公园里反向的队伍——最后进去的会第一个出来！" }
  },
  {
    id: "cmotsvh9k0003trboqbvo3dzb",
    descriptionOptions: { en: "A timer that shows how long you've been thinking about something. It helps you s", id: "Penghitung waktu yang menunjukkan berapa lama kamu memikirkan sesuatu. Membantu kamu fokus!", zh: "一个显示你思考了多久的计时器。帮你保持专注！" },
    funFactOptions: { en: "This timer can even count up to an hour and a half! That's a long time to think!", id: "Penghitung waktu ini bisa menghitung sampai satu setengah jam! Itu waktu yang lama untuk berpikir!", zh: "这个计时器最多能数到一个半小时！那是很长的一段思考时间！" }
  },
  {
    id: "cmottxs2m0001trlwl2th2w65",
    descriptionOptions: { en: "A funny name for a pet fish or a game about fish, like a fun toy or app!", id: "Nama lucu untuk ikan peliharaan atau permainan tentang ikan, seperti mainan atau aplikasi!", zh: "一个有趣的名字，指宠物鱼或关于鱼的游戏，就像玩具或应用！" },
    funFactOptions: { en: "Some fish can talk to each other with sounds, like a secret language!", id: "Beberapa ikan bisa bicara satu sama lain dengan suara, seperti bahasa rahasia!", zh: "有些鱼可以用声音互相交谈，就像一种秘密语言！" }
  },
  {
    id: "cmoturah10001trxgwzsk1184",
    descriptionOptions: { en: "A screen showing fun games like Roblox and others for kids to play and have fun!", id: "Layar yang menunjukkan permainan seru seperti Roblox dan lainnya untuk anak-anak main!", zh: "屏幕上显示着像Roblox这样的有趣游戏，供孩子们玩耍！" },
    funFactOptions: { en: "Roblox is a game where you can build your own world and play with friends!", id: "Roblox adalah permainan di mana kamu bisa membangun dunia sendiri dan bermain dengan teman!", zh: "Roblox是一个你可以建造自己的世界并和朋友一起玩的游戏！" }
  },
  {
    id: "cmotuwidf0001trkob521fgyp",
    descriptionOptions: { en: "A big, gentle shark with white spots on its gray skin. It's huge and lives in th", id: "Hiu besar yang jinak dengan bintik putih di kulit abu-abunya. Sangat besar dan tinggal di laut.", zh: "一条巨大的、温和的鲨鱼，灰色皮肤上有白色斑点。它很大，生活在海里。" },
    funFactOptions: { en: "Whale sharks are the biggest fish in the world, as big as a school bus!", id: "Hiu paus adalah ikan terbesar di dunia, sebesar bus sekolah!", zh: "鲸鲨是世界上最大的鱼，和校车一样大！" }
  },
  {
    id: "cmotv4hb40003trko3c49okdu",
    descriptionOptions: { en: "A sign with a picture of a bus on it, tells where buses stop to pick up people.", id: "Sebuah tanda dengan gambar bus di atasnya, memberi tahu di mana bus berhenti menjemput orang.", zh: "一个上面有公交车图案的标志，告诉人们公交车在哪里停靠接人。" },
    funFactOptions: { en: "Buses can carry lots of kids to school or fun places together!", id: "Bus bisa mengangkut banyak anak ke sekolah atau tempat seru bersama-sama!", zh: "公交车可以载着很多孩子一起去学校或好玩的地方！" }
  },
  {
    id: "cmotwgf050005tr9os0mzkywl",
    descriptionOptions: { en: "A picture that shows numbers and information in a fun way, like a graph or a bar", id: "Sebuah gambar yang menunjukkan angka dan informasi dengan cara menyenangkan, seperti grafik atau diagram batang.", zh: "一张以有趣方式展示数字和信息的图片，比如图表或柱状图。" },
    funFactOptions: { en: "Some charts can lie if they don't start from zero or are 3D, so always check the", id: "Beberapa grafik bisa berbohong jika tidak dimulai dari nol atau berbentuk 3D, jadi selalu cek sumbunya!", zh: "有些图表如果不是从零开始或者是3D的，可能会撒谎，所以要总是检查坐标轴！" }
  },
  {
    id: "cmotybgji0005trjwlvpobp6u",
    descriptionOptions: { en: "A table with letters like A, B, C and numbers inside. It lists numbers and has a", id: "Sebuah tabel dengan huruf seperti A, B, C dan angka di dalamnya. Menampilkan daftar angka.", zh: "一个有A、B、C等字母和数字的表格。里面列出了数字。" },
    funFactOptions: { en: "This table is like a secret code that tells us how many of something there are!", id: "Tabel ini seperti kode rahasia yang memberi tahu kita berapa banyak sesuatu itu!", zh: "这张表就像一个秘密代码，告诉我们某样东西的数量！" }
  },
  {
    id: "cmou7di0c0009tr9cqrbx82i0",
    descriptionOptions: { en: "This is a famous message that computers and programmers use to say hello to the", id: "Ini adalah pesan terkenal yang digunakan komputer dan programmer untuk menyapa dunia!", zh: "这是计算机和程序员的著名消息，用来向全世界问好！" },
    funFactOptions: { en: "The first 'Hello World' program was written in 1974 by a man named Kernighan and", id: "Program 'Hello World' pertama ditulis pada tahun 1974 oleh seorang pria bernama Kernighan.", zh: "第一个'Hello World'程序是在1974年由一位叫Kernighan的人写的。" }
  },
  {
    id: "cmou7e7tx000btr9cvtfppkxh",
    descriptionOptions: { en: "A screen showing special words that tell a computer what to do. It's like a secr", id: "Layar yang menunjukkan kata-kata khusus yang menyuruh komputer apa yang harus dilakukan.", zh: "屏幕上显示着告诉计算机该做什么的特殊词语。" },
    funFactOptions: { en: "Computers are so smart they can play games, draw pictures, and even talk to us!", id: "Komputer sangat pintar, mereka bisa main permainan, menggambar, dan bahkan bicara dengan kita!", zh: "计算机非常聪明，它们可以玩游戏、画画，甚至和我们说话！" }
  },
  {
    id: "cmou7glwt000dtr9cgq3y7pv2",
    descriptionOptions: { en: "A tiny thing you plant in the ground to grow a plant or a tree. It has a little", id: "Benda kecil yang kamu tanam di tanah untuk menumbuhkan tanaman atau pohon!", zh: "你种在土里的小东西，能长出植物或大树！" },
    funFactOptions: { en: "Some seeds can sleep for hundreds of years before they start to grow!", id: "Beberapa biji bisa tidur selama ratusan tahun sebelum mereka mulai tumbuh!", zh: "有些种子可以在土里沉睡数百年才开始生长！" }
  },
  {
    id: "cmou7h2cp000ftr9cp0bjcyt8",
    descriptionOptions: { en: "A colorful poster showing game logos and a big number 12 for a game reward!", id: "Poster warna-warni yang menunjukkan logo permainan dan angka 12 untuk hadiah permainan!", zh: "一张彩色海报，展示游戏标志和数字12作为游戏奖励！" },
    funFactOptions: { en: "You can win lots of fun coins just by playing games with friends!", id: "Kamu bisa memenangkan banyak koin hanya dengan bermain permainan dengan teman!", zh: "你只需要和朋友一起玩游戏，就能赢得很多金币！" }
  },
  {
    id: "cmou7jqr3000htr9cupavtyf4",
    descriptionOptions: { en: "A tiny thing you can plant to grow a big plant or tree!", id: "Benda kecil yang bisa kamu tanam untuk menumbuhkan tanaman atau pohon besar!", zh: "你可以种下的小东西，能长出植物或大树！" },
    funFactOptions: { en: "Some seeds can wait for years in the ground before they grow!", id: "Beberapa biji bisa menunggu selama bertahun-tahun di tanah sebelum tumbuh!", zh: "有些种子可以在土里等待多年才开始生长！" }
  },
  {
    id: "cmou7kyns000jtr9c82h9t91f",
    descriptionOptions: { en: "A board with numbers and arrows showing how to solve a puzzle by moving tiles ar", id: "Sebuah papan dengan angka dan anak panah yang menunjukkan cara memecahkan teka-teki.", zh: "一个有数字和箭头的板子，显示如何通过移动方块来解谜。" },
    funFactOptions: { en: "Some puzzles have millions of ways to mix up the tiles, but only one way to solv", id: "Beberapa teka-teki memiliki jutaan cara untuk mengacak ubin, tapi hanya satu cara untuk memecahkannya!", zh: "有些拼图有数百万种打乱方块的方式，但只有一种解法！" }
  },
  {
    id: "cmou7m5ps000ltr9c9i77ntvq",
    descriptionOptions: { en: "A screen that shows what's happening on a computer, like a magic box that talks", id: "Layar yang menunjukkan apa yang terjadi di komputer, seperti kotak ajaib yang bicara!", zh: "显示计算机上发生的事情的屏幕，就像一个会说话的魔法盒！" },
    funFactOptions: { en: "This screen can talk to websites and tell them what to do, like a secret helper", id: "Layar ini bisa bicara ke situs web dan menyuruh mereka apa yang harus dilakukan, seperti pembantu rahasia!", zh: "这个屏幕可以和网站对话，告诉它们该做什么，就像一个秘密助手！" }
  },
  {
    id: "cmou7n3qp000ntr9cxl531uhh",
    descriptionOptions: { en: "A big, rough, gray stone with bumps and little yellow spots on it. It's hard and", id: "Batu besar yang kasar dan abu-abu dengan benjolan dan bintik kuning di atasnya.", zh: "一块巨大、粗糙的灰色石头，上面有凸起和小黄点。" },
    funFactOptions: { en: "Some rocks are as old as dinosaurs! They've been on Earth for millions of years.", id: "Beberapa batu se tua dinosaurus! Mereka sudah ada di Bumi selama jutaan tahun.", zh: "有些石头和恐龙一样古老！它们在地球上已经存在数百万年了。" }
  },
  {
    id: "cmou7ncs2000ptr9cclzzjl2z",
    descriptionOptions: { en: "A big, rough wall made of gray stones. It has some yellow and green spots on it!", id: "Dinding besar yang kasar terbuat dari batu abu-abu. Ada bintik kuning dan hijau di atasnya!", zh: "一面巨大的粗糙石墙，由灰色石头砌成。上面有黄色和绿色的斑点！" },
    funFactOptions: { en: "Some stone walls are over 1000 years old and have been touched by kings and knig", id: "Beberapa dinding batu berusia lebih dari 1000 tahun dan pernah disentuh oleh raja dan ksatria!", zh: "有些石墙已经有1000多年的历史，国王和骑士曾经触摸过它们！" }
  },
  {
    id: "cmou7oc1l000ttr9cdx5nsyp7",
    descriptionOptions: { en: "Soft, fluffy things in the sky that look like cotton candy. They can be white or", id: "Benda lembut dan seperti kapas di langit yang terlihat seperti permen kapas. Bisa putih atau abu-abu.", zh: "天空中柔软、蓬松的东西，看起来像棉花糖。可以是白色或灰色的。" },
    funFactOptions: { en: "Clouds are made of tiny water drops or ice crystals that float in the sky!", id: "Awan terbuat dari tetesan air kecil atau kristal es yang mengambang di langit!", zh: "云是由微小的水滴或冰晶组成的，漂浮在天空中！" }
  },
  {
    id: "cmou7q77q000vtr9cenjyeeba",
    descriptionOptions: { en: "A round, brown ball made of soil and small bits of wood and leaves. It's like a", id: "Bola bundar berwarna cokelat terbuat dari tanah dan serpihan kayu serta daun.", zh: "一个由泥土、小木片和树叶制成的圆形棕色球。" },
    funFactOptions: { en: "This ball is like a tiny garden where tiny worms and bugs live and work together", id: "Bola ini seperti taman kecil di mana cacing dan serangga kecil tinggal dan bekerja bersama!", zh: "这个球就像一个小小的花园，里面住着小虫子和昆虫一起工作！" }
  },
  {
    id: "cmou8iedb0001trqkzu0t77w0",
    descriptionOptions: { en: "A big, smooth blue wall with a bumpy texture. It's like a giant blue painting on", id: "Dinding besar yang halus berwarna biru dengan tekstur berbukit-bukit. Seperti lukisan biru raksasa!", zh: "一面巨大、光滑的蓝墙，有凹凸不平的纹理。就像一幅巨大的蓝色画作！" },
    funFactOptions: { en: "Some walls are painted to look like they have tiny bumps, even though they're sm", id: "Beberapa dinding dicat agar terlihat seperti berbukit-bukit, padahal sebenarnya halus!", zh: "有些墙壁被涂成看起来有凸起的样子，即使它们实际上是光滑的！" }
  },
  {
    id: "cmov5xtud0001trmgv3en7l11",
    descriptionOptions: { en: "Ini adalah dinding yang berwarna biru, teksturnya kasar dan bergerigi. Digunakan", id: "Ini adalah dinding yang berwarna biru, teksturnya kasar dan bergerigi. Digunakan untuk...", zh: "这是一面蓝色的墙，质地粗糙有凹凸。被用来..." },
    funFactOptions: { en: "Dinding ini bisa jadi tempat yang indah untuk kita bermain atau menulis sesuatu!", id: "Dinding ini bisa jadi tempat yang indah untuk kita bermain atau menulis sesuatu!", zh: "这面墙可以成为我们玩耍或写东西的美丽地方！" }
  }
];

async function main() {
  for (const item of translations) {
    await db.historyItem.update({
      where: { id: item.id },
      data: {
        descriptionOptions: item.descriptionOptions,
        funFactOptions: item.funFactOptions,
      },
    });
    console.log(`Updated: ${item.id}`);
  }
  console.log('Done!');
}

main().finally(() => db.$disconnect());
