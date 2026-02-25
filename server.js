const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// 1. Connection Pool 설정 (연결이 끊겨도 자동으로 다시 연결해줍니다)
const pool = mysql.createPool({
  host: 'database-1.cpkbvgqdtfpl.us-east-1.rds.amazonaws.com',
  user: 'admin',
  password: '00000000',
  database: 'apple_game',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 프로미스(Promise)를 사용하여 더 깔끔하게 쿼리를 날릴 수 있게 설정
const db = pool.promise();

// 연결 확인 로그
console.log('✅ 데이터베이스 커넥션 풀이 생성되었습니다.');

// 2. 서버 상태 확인용 (로드 밸런서 접속 시 확인 가능)
app.get('/', (req, res) => {
  res.send('🍎 사과 게임 백엔드 서버가 정상 작동 중입니다!');
});

// 3. 점수 저장 API (POST /save-score)
app.post('/save-score', async (req, res) => {
  const { username, score } = req.body;
  const sql = 'INSERT INTO rankings (username, score) VALUES (?, ?)';
  
  try {
    console.log(`📝 점수 저장 요청: ${username}님, ${score}점`);
    await db.query(sql, [username, score]);
    res.send('점수가 성공적으로 저장되었습니다!');
  } catch (err) {
    console.error('❌ DB 저장 에러:', err.message);
    res.status(500).send('데이터베이스 저장 오류');
  }
});

// 4. 랭킹 불러오기 API (GET /rankings)
app.get('/rankings', async (req, res) => {
  const sql = 'SELECT username, score FROM rankings ORDER BY score DESC LIMIT 10';
  
  try {
    const [results] = await db.query(sql);
    console.log(`🏆 랭킹 조회 완료: ${results.length}건`);
    res.json(results);
  } catch (err) {
    console.error('❌ 랭킹 불러오기 에러:', err.message);
    res.status(500).send('데이터 불러오기 오류');
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 백엔드 서버가 ${PORT}번 포트에서 실행 중입니다.`);
});