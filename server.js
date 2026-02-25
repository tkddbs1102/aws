const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); // 다른 도메인(S3 등)에서의 접속을 허용해줍니다.
const app = express();

app.use(cors());
app.use(express.json());

// 1. AWS RDS 연결 설정
const db = mysql.createConnection({
  host: 'database-1.cpkbvgqdtfpl.us-east-1.rds.amazonaws.com',      // 예: mydb.c1234.ap-northeast-2.rds.amazonaws.com
  user: 'admin',                  // RDS 설정 시 만든 마스터 사용자 이름
  password: '00000000',       // RDS 비밀번호
  database: 'database-1'             // RDS에 생성한 데이터베이스 이름
});

// RDS 연결 확인
db.connect(err => {
  if (err) {
    console.error('RDS 연결 실패:', err);
    return;
  }
  console.log('RDS 데이터베이스에 성공적으로 연결되었습니다.');
});

// 2. 점수 저장 API (POST /save-score)
app.post('/save-score', (req, res) => {
  const { username, score } = req.body;
  const sql = 'INSERT INTO rankings (username, score) VALUES (?, ?)';
  
  db.query(sql, [username, score], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('데이터베이스 저장 오류');
    }
    res.send('점수가 성공적으로 저장되었습니다!');
  });
});

// 3. 랭킹 불러오기 API (GET /rankings)
app.get('/rankings', (req, res) => {
  const sql = 'SELECT username, score FROM rankings ORDER BY score DESC LIMIT 10';
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('데이터 불러오기 오류');
    }
    res.json(results);
  });
});

app.listen(3000, () => {
  console.log('백엔드 서버가 3000번 포트에서 실행 중입니다.');
});