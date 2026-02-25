const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// 1. RDS 연결 설정 (가장 안정적인 Pool 방식)
const pool = mysql.createPool({
  host: 'database-1.cpkbvgqdtfpl.us-east-1.rds.amazonaws.com',
  user: 'admin',
  password: '00000000',
  database: 'apple_game', // image_339f7e.png에서 확인됨
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
});

const db = pool.promise();

// 서버 루트 접속 확인
app.get('/', (req, res) => res.send('🍎 백엔드 서버 정상!'));

// 2. 랭킹 불러오기 API (여기서 500 에러가 나지 않게 함)
app.get('/rankings', async (req, res) => {
  try {
    console.log("🏆 랭킹 요청 수신됨");
    const [results] = await db.query('SELECT username, score FROM rankings ORDER BY score DESC LIMIT 10');
    console.log(`✅ 조회 성공: ${results.length}건`);
    res.json(results);
  } catch (err) {
    console.error('❌ 랭킹 로드 실패:', err.message);
    res.status(500).json({ error: "DB 에러", detail: err.message });
  }
});

// 3. 점수 저장 API
app.post('/save-score', async (req, res) => {
  const { username, score } = req.body;
  try {
    await db.query('INSERT INTO rankings (username, score) VALUES (?, ?)', [username, score]);
    console.log(`📝 저장 완료: ${username}님 ${score}점`);
    res.send('저장 성공');
  } catch (err) {
    console.error('❌ 저장 실패:', err.message);
    res.status(500).send('저장 실패');
  }
});

app.listen(3000, () => console.log('🚀 서버가 3000번 포트에서 다시 태어났습니다!'));