const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// 1. AWS RDS 연결 설정 (사용자님의 정보 그대로 유지)
const db = mysql.createConnection({
  host: 'database-1.cpkbvgqdtfpl.us-east-1.rds.amazonaws.com',
  user: 'admin',
  password: '00000000',
  database: 'apple_game' //
});

// RDS 연결 확인 및 에러 로깅 강화
db.connect(err => {
  if (err) {
    console.error('❌ RDS 연결 실패 원인:', err.message);
    return;
  }
  console.log('✅ RDS 데이터베이스(apple_game)에 성공적으로 연결되었습니다.');
});

// 2. [추가] 서버 상태 확인용 루트 경로 (Cannot GET / 방지) ⭐
// 이제 로드 밸런서 주소로 접속하면 이 메시지가 뜹니다.
app.get('/', (req, res) => {
  res.send('🍎 사과 게임 백엔드 서버가 정상 작동 중입니다!');
});

// 3. 점수 저장 API (POST /save-score)
app.post('/save-score', (req, res) => {
  const { username, score } = req.body;
  const sql = 'INSERT INTO rankings (username, score) VALUES (?, ?)';
  
  console.log(`📝 점수 저장 요청: ${username}님, ${score}점`); // PM2 로그에서 확인 가능

  db.query(sql, [username, score], (err, result) => {
    if (err) {
      console.error('❌ DB 저장 에러:', err.message);
      return res.status(500).send('데이터베이스 저장 오류');
    }
    res.send('점수가 성공적으로 저장되었습니다!');
  });
});

// 4. 랭킹 불러오기 API (GET /rankings) ⭐ [랭킹 보기 버튼용]
app.get('/rankings', (req, res) => {
  // 최고 점수 상위 10명을 가져옵니다.
  const sql = 'SELECT username, score FROM rankings ORDER BY score DESC LIMIT 10';
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ 랭킹 불러오기 에러:', err.message);
      return res.status(500).send('데이터 불러오기 오류');
    }
    console.log(`🏆 랭킹 조회 완료: ${results.length}건`);
    res.json(results);
  });
});

// 서버 실행
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 백엔드 서버가 ${PORT}번 포트에서 실행 중입니다.`);
});