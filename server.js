const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// 1. Connection Pool 설정 (가장 안정적인 방식)
const pool = mysql.createPool({
  host: 'database-1.cpkbvgqdtfpl.us-east-1.rds.amazonaws.com',
  user: 'admin',
  password: '00000000',
  database: 'apple_game', // 실제 DB 이름 확인
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  keepAliveInitialDelay: 10000, // 연결 유지를 위한 설정
  enableKeepAlive: true
});

const db = pool.promise();

// [추가] 서버 시작 시 RDS 연결 상태를 즉시 점검합니다.
async function checkConnection() {
  try {
    const [rows] = await db.query('SELECT 1');
    console.log('✅ RDS 데이터베이스 연결 상태 양호!');
  } catch (err) {
    console.error('❌ RDS 연결 점검 실패:', err.message);
  }
}
checkConnection();

// 2. 서버 상태 확인용 루트 경로
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
  // 최고 점수 상위 10명을 가져옵니다.
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