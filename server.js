const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

app.post('/api/diagnose', (req, res) => {
  console.log('Received image for diagnosis.');
  const startTime = Date.now();

  setTimeout(() => {
    const processingTime = (Date.now() - startTime) / 1000;
    const diagnosis = {
      img: '/images/보웬병/Z4_15968_P0_L0.png',
      diagnosis: '보웬병',
      confidence: 0.92,
      riskLevel: '높음',
      description: '보웬병은 피부에 발생하는 상피내암의 일종으로, 조기 발견 시 완치가 가능합니다. 진단을 위해 반드시 조직검사가 필요합니다.',
      recommendations: [
        '피부과 전문의와 상담하세요.',
        '조직검사를 통해 확진을 받으세요.',
        '정기적으로 피부 상태를 관찰하세요.'
      ],
      diagnosisDate: new Date().toISOString()
    };

    console.log('Sending diagnosis result:', diagnosis);
    res.json(diagnosis);
  }, 2000);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});