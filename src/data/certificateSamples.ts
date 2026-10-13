/**
 * Certificate and Identity Proof Generators for Tutor Verification
 * Provides realistic, high-fidelity official documents for Admin Preview:
 * - 10th Class High School Marksheet (Board of Secondary Education, Odisha)
 * - 12th Class Higher Secondary Marksheet (Council of Higher Secondary Education, Odisha)
 * - University Degree / Graduation Certificate (Berhampur / Utkal University)
 * - Government of India Identity Proof (Aadhaar Card)
 */

export function generateTenthMarksheetSvg(tutorName: string, year = '2016', score = '91.4%', school = 'Rayagada High School'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1100" width="100%" height="100%">
    <defs>
      <pattern id="watermark10" width="200" height="200" patternUnits="userSpaceOnUse">
        <text x="30" y="100" font-family="serif" font-size="16" fill="#000" fill-opacity="0.03" transform="rotate(-30 30,100)">BSE ODISHA</text>
      </pattern>
    </defs>
    <!-- Parchment Background -->
    <rect width="800" height="1100" fill="#fffef9" />
    <rect width="800" height="1100" fill="url(#watermark10)" />
    <!-- Ornate Borders -->
    <rect x="25" y="25" width="750" height="1050" fill="none" stroke="#8b5e3c" stroke-width="4" />
    <rect x="35" y="35" width="730" height="1030" fill="none" stroke="#2c5282" stroke-width="1.5" />
    <rect x="42" y="42" width="716" height="1016" fill="none" stroke="#8b5e3c" stroke-width="0.75" />
    
    <!-- Emblem & Header -->
    <circle cx="400" cy="90" r="32" fill="#2b6cb0" />
    <circle cx="400" cy="90" r="28" fill="#fff" />
    <text x="400" y="96" font-family="serif" font-size="20" font-weight="bold" fill="#2b6cb0" text-anchor="middle">★</text>
    
    <text x="400" y="145" font-family="'Times New Roman', serif" font-size="24" font-weight="bold" fill="#1a365d" text-anchor="middle" letter-spacing="1">BOARD OF SECONDARY EDUCATION, ODISHA</text>
    <text x="400" y="170" font-family="sans-serif" font-size="13" font-weight="600" fill="#4a5568" text-anchor="middle">HIGH SCHOOL CERTIFICATE EXAMINATION (ANNUAL)</text>
    <text x="400" y="195" font-family="'Times New Roman', serif" font-size="18" font-style="italic" font-weight="bold" fill="#742a2a" text-anchor="middle">PROVISIONAL MARKSHEET &amp; PASS CERTIFICATE</text>
    
    <!-- Meta details banner -->
    <line x1="60" y1="215" x2="740" y2="215" stroke="#cbd5e0" stroke-width="1" />
    <text x="70" y="235" font-family="monospace" font-size="11" fill="#718096">ROLL NO: <tspan font-weight="bold" fill="#1a202c">16RG04892</tspan></text>
    <text x="320" y="235" font-family="monospace" font-size="11" fill="#718096">ENROLMENT: <tspan font-weight="bold" fill="#1a202c">BSE/RG/2014-16</tspan></text>
    <text x="590" y="235" font-family="monospace" font-size="11" fill="#718096">YEAR: <tspan font-weight="bold" fill="#1a202c">${year}</tspan></text>
    <line x1="60" y1="245" x2="740" y2="245" stroke="#cbd5e0" stroke-width="1" />
    
    <!-- Candidate Details -->
    <g transform="translate(70, 275)" font-family="sans-serif" font-size="13">
      <text x="0" y="0" fill="#4a5568">Candidate's Full Name:</text>
      <text x="180" y="0" font-weight="bold" fill="#1a202c" font-size="15">${tutorName.toUpperCase()}</text>
      
      <text x="0" y="30" fill="#4a5568">Mother's Name:</text>
      <text x="180" y="30" font-weight="600" fill="#2d3748">SMT. SAROJINI DEVI</text>
      
      <text x="0" y="60" fill="#4a5568">Father's Name:</text>
      <text x="180" y="60" font-weight="600" fill="#2d3748">SHRI K. RAMA RAO</text>
      
      <text x="0" y="90" fill="#4a5568">School / Institution:</text>
      <text x="180" y="90" font-weight="600" fill="#2d3748">${school.toUpperCase()}</text>
      
      <text x="0" y="120" fill="#4a5568">Examination Center:</text>
      <text x="180" y="120" font-weight="600" fill="#2d3748">GOVT. BOYS HIGH SCHOOL, RAYAGADA (DIST. RAYAGADA)</text>
    </g>
    
    <!-- Marks Table -->
    <g transform="translate(60, 435)">
      <!-- Header -->
      <rect x="0" y="0" width="680" height="32" fill="#2c5282" />
      <text x="30" y="21" font-family="sans-serif" font-size="11" font-weight="bold" fill="#fff">SL</text>
      <text x="80" y="21" font-family="sans-serif" font-size="11" font-weight="bold" fill="#fff">SUBJECT NAME</text>
      <text x="320" y="21" font-family="sans-serif" font-size="11" font-weight="bold" fill="#fff">MAX</text>
      <text x="420" y="21" font-family="sans-serif" font-size="11" font-weight="bold" fill="#fff">PASS</text>
      <text x="520" y="21" font-family="sans-serif" font-size="11" font-weight="bold" fill="#fff">MARKS SECURED</text>
      <text x="635" y="21" font-family="sans-serif" font-size="11" font-weight="bold" fill="#fff">GRADE</text>
      
      <!-- Rows -->
      <rect x="0" y="32" width="680" height="28" fill="#f7fafc" />
      <text x="30" y="51" font-family="monospace" font-size="12">1</text>
      <text x="80" y="51" font-family="sans-serif" font-size="12">FIRST LANGUAGE (ODIA / TELUGU)</text>
      <text x="320" y="51" font-family="monospace" font-size="12">100</text>
      <text x="420" y="51" font-family="monospace" font-size="12">30</text>
      <text x="540" y="51" font-family="monospace" font-size="12" font-weight="bold">92</text>
      <text x="645" y="51" font-family="sans-serif" font-size="12" font-weight="bold" fill="#22543d">A1</text>
      
      <rect x="0" y="60" width="680" height="28" fill="#fff" />
      <text x="30" y="79" font-family="monospace" font-size="12">2</text>
      <text x="80" y="79" font-family="sans-serif" font-size="12">SECOND LANGUAGE (ENGLISH)</text>
      <text x="320" y="79" font-family="monospace" font-size="12">100</text>
      <text x="420" y="79" font-family="monospace" font-size="12">30</text>
      <text x="540" y="79" font-family="monospace" font-size="12" font-weight="bold">88</text>
      <text x="645" y="79" font-family="sans-serif" font-size="12" font-weight="bold" fill="#22543d">A2</text>
      
      <rect x="0" y="88" width="680" height="28" fill="#f7fafc" />
      <text x="30" y="107" font-family="monospace" font-size="12">3</text>
      <text x="80" y="107" font-family="sans-serif" font-size="12">THIRD LANGUAGE (HINDI / SANSKRIT)</text>
      <text x="320" y="107" font-family="monospace" font-size="12">100</text>
      <text x="420" y="107" font-family="monospace" font-size="12">30</text>
      <text x="540" y="107" font-family="monospace" font-size="12" font-weight="bold">90</text>
      <text x="645" y="107" font-family="sans-serif" font-size="12" font-weight="bold" fill="#22543d">A1</text>
      
      <rect x="0" y="116" width="680" height="28" fill="#fff" />
      <text x="30" y="135" font-family="monospace" font-size="12">4</text>
      <text x="80" y="135" font-family="sans-serif" font-size="12" font-weight="bold">MATHEMATICS (MTH)</text>
      <text x="320" y="135" font-family="monospace" font-size="12">100</text>
      <text x="420" y="135" font-family="monospace" font-size="12">30</text>
      <text x="540" y="135" font-family="monospace" font-size="12" font-weight="bold" fill="#1a365d">96</text>
      <text x="645" y="135" font-family="sans-serif" font-size="12" font-weight="bold" fill="#22543d">A1</text>
      
      <rect x="0" y="144" width="680" height="28" fill="#f7fafc" />
      <text x="30" y="163" font-family="monospace" font-size="12">5</text>
      <text x="80" y="163" font-family="sans-serif" font-size="12" font-weight="bold">GENERAL SCIENCE (GSC)</text>
      <text x="320" y="163" font-family="monospace" font-size="12">100</text>
      <text x="420" y="163" font-family="monospace" font-size="12">30</text>
      <text x="540" y="163" font-family="monospace" font-size="12" font-weight="bold" fill="#1a365d">94</text>
      <text x="645" y="163" font-family="sans-serif" font-size="12" font-weight="bold" fill="#22543d">A1</text>
      
      <rect x="0" y="172" width="680" height="28" fill="#fff" />
      <text x="30" y="191" font-family="monospace" font-size="12">6</text>
      <text x="80" y="191" font-family="sans-serif" font-size="12">SOCIAL SCIENCE (SSC)</text>
      <text x="320" y="191" font-family="monospace" font-size="12">100</text>
      <text x="420" y="191" font-family="monospace" font-size="12">30</text>
      <text x="540" y="191" font-family="monospace" font-size="12" font-weight="bold">88</text>
      <text x="645" y="191" font-family="sans-serif" font-size="12" font-weight="bold" fill="#22543d">A2</text>
      
      <!-- Total Bar -->
      <rect x="0" y="200" width="680" height="34" fill="#edf2f7" stroke="#cbd5e0" stroke-width="1" />
      <text x="80" y="222" font-family="sans-serif" font-size="12" font-weight="bold">AGGREGATE TOTAL</text>
      <text x="320" y="222" font-family="monospace" font-size="12" font-weight="bold">600</text>
      <text x="540" y="222" font-family="monospace" font-size="14" font-weight="bold" fill="#2b6cb0">548 / 600</text>
      <text x="630" y="222" font-family="sans-serif" font-size="13" font-weight="bold" fill="#22543d">GRADE A1 (${score})</text>
    </g>
    
    <!-- Result Declaration Box -->
    <rect x="60" y="700" width="680" height="50" fill="#ebf8ff" rx="6" stroke="#bee3f8" stroke-width="1" />
    <text x="80" y="730" font-family="sans-serif" font-size="14" font-weight="bold" fill="#2b6cb0">RESULT: PASSED IN FIRST DIVISION WITH DISTINCTION</text>
    
    <!-- Official Seals & Signatures -->
    <g transform="translate(100, 880)">
      <circle cx="40" cy="40" r="38" fill="none" stroke="#742a2a" stroke-width="2" stroke-dasharray="4 2" />
      <text x="40" y="36" font-family="serif" font-size="9" font-weight="bold" fill="#742a2a" text-anchor="middle">BOARD OF SEC. EDU.</text>
      <text x="40" y="48" font-family="serif" font-size="8" font-weight="bold" fill="#742a2a" text-anchor="middle">CUTTACK (ODISHA)</text>
      <text x="40" y="58" font-family="serif" font-size="7" fill="#742a2a" text-anchor="middle">OFFICIAL EMBOSS</text>
      <text x="40" y="100" font-family="sans-serif" font-size="11" fill="#718096" text-anchor="middle">Headmaster / Principal</text>
    </g>
    
    <g transform="translate(560, 880)">
      <!-- Signature scribble -->
      <path d="M 0 35 Q 25 10 50 40 T 100 25 T 140 45" fill="none" stroke="#1a365d" stroke-width="2" />
      <text x="70" y="80" font-family="serif" font-size="12" font-weight="bold" fill="#2d3748" text-anchor="middle">Secretary / Controller of Exams</text>
      <text x="70" y="96" font-family="sans-serif" font-size="10" fill="#718096" text-anchor="middle">Board of Secondary Education, Odisha</text>
    </g>
    
    <!-- Barcode / QR placeholder -->
    <rect x="60" y="990" width="220" height="40" fill="#e2e8f0" />
    <text x="170" y="1015" font-family="monospace" font-size="10" fill="#4a5568" text-anchor="middle">|||||||||| |||||| ||||||||||| 16RG04892</text>
    <text x="600" y="1015" font-family="sans-serif" font-size="10" fill="#a0aec0">VERIFIED GENUINE ACADEMIC RECORD</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function generateTwelfthMarksheetSvg(tutorName: string, year = '2018', score = '88.6%', college = 'Rayagada Autonomous College'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1100" width="100%" height="100%">
    <rect width="800" height="1100" fill="#fdfbf7" />
    <rect x="25" y="25" width="750" height="1050" fill="none" stroke="#276749" stroke-width="3" />
    <rect x="33" y="33" width="734" height="1034" fill="none" stroke="#b7791f" stroke-width="1.5" />
    
    <!-- Emblem -->
    <circle cx="400" cy="85" r="30" fill="#276749" />
    <text x="400" y="92" font-family="serif" font-size="20" font-weight="bold" fill="#fff" text-anchor="middle">CHSE</text>
    
    <text x="400" y="140" font-family="'Times New Roman', serif" font-size="23" font-weight="bold" fill="#1c4532" text-anchor="middle">COUNCIL OF HIGHER SECONDARY EDUCATION, ODISHA</text>
    <text x="400" y="165" font-family="sans-serif" font-size="14" font-weight="600" fill="#2d3748" text-anchor="middle">+2 HIGHER SECONDARY EXAMINATION (SCIENCE STREAM)</text>
    <text x="400" y="190" font-family="'Times New Roman', serif" font-size="16" font-style="italic" font-weight="bold" fill="#975a16" text-anchor="middle">MEMORANDUM OF MARKS &amp; PASS CERTIFICATE</text>
    
    <line x1="60" y1="210" x2="740" y2="210" stroke="#cbd5e0" stroke-width="1" />
    <text x="70" y="230" font-family="monospace" font-size="11" fill="#4a5568">ROLL NO: <tspan font-weight="bold" fill="#1a202c">418SA094</tspan></text>
    <text x="320" y="230" font-family="monospace" font-size="11" fill="#4a5568">REGN NO: <tspan font-weight="bold" fill="#1a202c">CHSE/16/RG082</tspan></text>
    <text x="600" y="230" font-family="monospace" font-size="11" fill="#4a5568">PASS YEAR: <tspan font-weight="bold" fill="#1a202c">${year}</tspan></text>
    <line x1="60" y1="240" x2="740" y2="240" stroke="#cbd5e0" stroke-width="1" />
    
    <g transform="translate(70, 270)" font-family="sans-serif" font-size="13">
      <text x="0" y="0" fill="#4a5568">Candidate Name:</text>
      <text x="180" y="0" font-weight="bold" fill="#1a202c" font-size="15">${tutorName.toUpperCase()}</text>
      
      <text x="0" y="30" fill="#4a5568">Institution / College:</text>
      <text x="180" y="30" font-weight="600" fill="#2d3748">${college.toUpperCase()}</text>
      
      <text x="0" y="60" fill="#4a5568">Stream &amp; Group:</text>
      <text x="180" y="60" font-weight="600" fill="#2d3748">SCIENCE (PHYSICS, CHEMISTRY, MATHEMATICS, BIOLOGY)</text>
    </g>
    
    <!-- Table -->
    <g transform="translate(60, 390)">
      <rect x="0" y="0" width="680" height="32" fill="#276749" />
      <text x="25" y="21" font-family="sans-serif" font-size="11" font-weight="bold" fill="#fff">CODE</text>
      <text x="90" y="21" font-family="sans-serif" font-size="11" font-weight="bold" fill="#fff">SUBJECT</text>
      <text x="290" y="21" font-family="sans-serif" font-size="11" font-weight="bold" fill="#fff">THEORY</text>
      <text x="390" y="21" font-family="sans-serif" font-size="11" font-weight="bold" fill="#fff">PRAC</text>
      <text x="490" y="21" font-family="sans-serif" font-size="11" font-weight="bold" fill="#fff">TOTAL</text>
      <text x="610" y="21" font-family="sans-serif" font-size="11" font-weight="bold" fill="#fff">GRADE</text>
      
      <rect x="0" y="32" width="680" height="28" fill="#f0fff4" />
      <text x="25" y="51" font-family="monospace" font-size="12">ENG</text>
      <text x="90" y="51" font-family="sans-serif" font-size="12">ENGLISH (COMPULSORY)</text>
      <text x="300" y="51" font-family="monospace" font-size="12">86</text>
      <text x="400" y="51" font-family="monospace" font-size="12">-</text>
      <text x="500" y="51" font-family="monospace" font-size="12" font-weight="bold">86</text>
      <text x="620" y="51" font-family="sans-serif" font-size="12" font-weight="bold" fill="#22543d">A</text>
      
      <rect x="0" y="60" width="680" height="28" fill="#fff" />
      <text x="25" y="79" font-family="monospace" font-size="12">MTH</text>
      <text x="90" y="79" font-family="sans-serif" font-size="12" font-weight="bold">MATHEMATICS</text>
      <text x="300" y="79" font-family="monospace" font-size="12">94</text>
      <text x="400" y="79" font-family="monospace" font-size="12">-</text>
      <text x="500" y="79" font-family="monospace" font-size="12" font-weight="bold">94</text>
      <text x="620" y="79" font-family="sans-serif" font-size="12" font-weight="bold" fill="#22543d">A+</text>
      
      <rect x="0" y="88" width="680" height="28" fill="#f0fff4" />
      <text x="25" y="107" font-family="monospace" font-size="12">PHY</text>
      <text x="90" y="107" font-family="sans-serif" font-size="12" font-weight="bold">PHYSICS (TH + PR)</text>
      <text x="300" y="107" font-family="monospace" font-size="12">62</text>
      <text x="400" y="107" font-family="monospace" font-size="12">28</text>
      <text x="500" y="107" font-family="monospace" font-size="12" font-weight="bold">90</text>
      <text x="620" y="107" font-family="sans-serif" font-size="12" font-weight="bold" fill="#22543d">A+</text>
      
      <rect x="0" y="116" width="680" height="28" fill="#fff" />
      <text x="25" y="135" font-family="monospace" font-size="12">CHM</text>
      <text x="90" y="135" font-family="sans-serif" font-size="12" font-weight="bold">CHEMISTRY (TH + PR)</text>
      <text x="300" y="135" font-family="monospace" font-size="12">60</text>
      <text x="400" y="135" font-family="monospace" font-size="12">27</text>
      <text x="500" y="135" font-family="monospace" font-size="12" font-weight="bold">87</text>
      <text x="620" y="135" font-family="sans-serif" font-size="12" font-weight="bold" fill="#22543d">A</text>
      
      <rect x="0" y="144" width="680" height="28" fill="#f0fff4" />
      <text x="25" y="163" font-family="monospace" font-size="12">BIO</text>
      <text x="90" y="163" font-family="sans-serif" font-size="12">BIOLOGY / CS</text>
      <text x="300" y="163" font-family="monospace" font-size="12">58</text>
      <text x="400" y="163" font-family="monospace" font-size="12">27</text>
      <text x="500" y="163" font-family="monospace" font-size="12" font-weight="bold">85</text>
      <text x="620" y="163" font-family="sans-serif" font-size="12" font-weight="bold" fill="#22543d">A</text>
      
      <rect x="0" y="180" width="680" height="34" fill="#c6f6d5" stroke="#9ae6b4" stroke-width="1" />
      <text x="90" y="202" font-family="sans-serif" font-size="12" font-weight="bold">OVERALL PERCENTAGE: ${score}</text>
      <text x="460" y="202" font-family="sans-serif" font-size="13" font-weight="bold" fill="#22543d">FIRST DIVISION WITH DISTINCTION</text>
    </g>
    
    <!-- Seals -->
    <g transform="translate(100, 890)">
      <circle cx="40" cy="40" r="36" fill="none" stroke="#276749" stroke-width="2" />
      <text x="40" y="38" font-family="serif" font-size="8" font-weight="bold" fill="#276749" text-anchor="middle">CHSE BHUBANESWAR</text>
      <text x="40" y="50" font-family="serif" font-size="7" fill="#276749" text-anchor="middle">AUTHENTIC SEAL</text>
      <text x="40" y="96" font-family="sans-serif" font-size="11" fill="#718096" text-anchor="middle">College Principal</text>
    </g>
    
    <g transform="translate(560, 890)">
      <path d="M 0 30 Q 30 5 60 35 T 120 20 T 150 40" fill="none" stroke="#276749" stroke-width="2" />
      <text x="75" y="80" font-family="serif" font-size="12" font-weight="bold" fill="#2d3748" text-anchor="middle">Controller of Examinations</text>
      <text x="75" y="96" font-family="sans-serif" font-size="10" fill="#718096" text-anchor="middle">CHSE, Odisha</text>
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function generateDegreeCertificateSvg(tutorName: string, degree = 'Bachelor of Science (B.Sc)', university = 'Berhampur University', year = '2021'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 680" width="100%" height="100%">
    <rect width="900" height="680" fill="#fffdfa" />
    <!-- Borders -->
    <rect x="25" y="25" width="850" height="630" fill="none" stroke="#975a16" stroke-width="4" />
    <rect x="35" y="35" width="830" height="610" fill="none" stroke="#742a2a" stroke-width="1.5" />
    <rect x="42" y="42" width="816" height="596" fill="none" stroke="#975a16" stroke-width="0.75" />
    
    <!-- University Crest -->
    <circle cx="450" cy="95" r="32" fill="#742a2a" />
    <text x="450" y="103" font-family="serif" font-size="22" font-weight="bold" fill="#fefcbf" text-anchor="middle">BU</text>
    
    <text x="450" y="155" font-family="'Cinzel', 'Times New Roman', serif" font-size="28" font-weight="bold" fill="#742a2a" text-anchor="middle" letter-spacing="2">${university.toUpperCase()}</text>
    <text x="450" y="180" font-family="serif" font-size="14" font-style="italic" fill="#718096" text-anchor="middle">Bhanja Bihar, Berhampur, Ganjam, Odisha - 760007</text>
    
    <text x="450" y="235" font-family="'Times New Roman', serif" font-size="18" font-style="italic" fill="#4a5568" text-anchor="middle">This is to certify that</text>
    
    <text x="450" y="280" font-family="'Times New Roman', serif" font-size="32" font-weight="bold" fill="#1a202c" text-anchor="middle" text-decoration="underline">${tutorName.toUpperCase()}</text>
    
    <text x="450" y="325" font-family="'Times New Roman', serif" font-size="18" fill="#4a5568" text-anchor="middle">having passed the prescribed examination held in the year <tspan font-weight="bold" fill="#1a202c">${year}</tspan></text>
    <text x="450" y="355" font-family="'Times New Roman', serif" font-size="18" fill="#4a5568" text-anchor="middle">has this day been admitted by the Syndicate to the Degree of</text>
    
    <text x="450" y="415" font-family="'Times New Roman', serif" font-size="26" font-weight="bold" fill="#2b6cb0" text-anchor="middle">${degree.toUpperCase()}</text>
    <text x="450" y="445" font-family="sans-serif" font-size="15" font-weight="600" fill="#276749" text-anchor="middle">FIRST CLASS WITH HONOURS &amp; DISTINCTION</text>
    
    <!-- Gold Foil Stamp -->
    <g transform="translate(450, 525)">
      <circle cx="0" cy="0" r="42" fill="#d69e2e" />
      <circle cx="0" cy="0" r="37" fill="#ecc94b" />
      <polygon points="0,-30 8,-10 30,-10 12,5 18,25 0,14 -18,25 -12,5 -30,-10 -8,-10" fill="#b7791f" />
      <text x="0" y="38" font-family="sans-serif" font-size="8" font-weight="bold" fill="#744210" text-anchor="middle">UNIVERSITY SEAL</text>
    </g>
    
    <!-- Signatures -->
    <g transform="translate(140, 530)">
      <path d="M 0 20 Q 30 0 60 25 T 120 15" fill="none" stroke="#2d3748" stroke-width="2" />
      <text x="60" y="45" font-family="serif" font-size="14" font-weight="bold" fill="#1a202c" text-anchor="middle">Registrar</text>
      <text x="60" y="60" font-family="sans-serif" font-size="10" fill="#718096" text-anchor="middle">${university}</text>
    </g>
    
    <g transform="translate(640, 530)">
      <path d="M 0 25 Q 40 5 80 30 T 140 10" fill="none" stroke="#2d3748" stroke-width="2" />
      <text x="70" y="45" font-family="serif" font-size="14" font-weight="bold" fill="#1a202c" text-anchor="middle">Vice-Chancellor</text>
      <text x="70" y="60" font-family="sans-serif" font-size="10" fill="#718096" text-anchor="middle">${university}</text>
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function generateAadhaarCardSvg(tutorName: string, aadhaarNum = '8492 1048 3921', locality = 'Indira Nagar, Rayagada'): string {
  const formattedAadhaar = aadhaarNum || '8492 1048 3921';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 440" width="100%" height="100%">
    <rect width="700" height="440" rx="14" fill="#ffffff" stroke="#cbd5e0" stroke-width="2" />
    
    <!-- Header Tricolor Stripes -->
    <rect x="0" y="0" width="700" height="12" fill="#ff9933" />
    <rect x="0" y="12" width="700" height="8" fill="#ffffff" />
    <rect x="0" y="20" width="700" height="12" fill="#138808" />
    
    <!-- Gov Emblem & Header Text -->
    <g transform="translate(30, 45)">
      <circle cx="20" cy="20" r="18" fill="#1a365d" />
      <text x="20" y="26" font-family="serif" font-size="18" fill="#fff" text-anchor="middle">🏛</text>
      <text x="50" y="18" font-family="sans-serif" font-size="13" font-weight="bold" fill="#1a202c">भारत सरकार | GOVERNMENT OF INDIA</text>
      <text x="50" y="34" font-family="sans-serif" font-size="11" font-weight="600" fill="#718096">भारतीय विशिष्ट पहचान प्राधिकरण | UIDAI</text>
    </g>
    
    <!-- Aadhaar Logo right -->
    <g transform="translate(600, 45)">
      <!-- Sun icon -->
      <circle cx="25" cy="20" r="15" fill="#dd6b20" />
      <text x="25" y="25" font-family="sans-serif" font-size="14" font-weight="bold" fill="#fff" text-anchor="middle">आधार</text>
    </g>
    
    <!-- Photo Box -->
    <rect x="40" y="110" width="130" height="160" fill="#edf2f7" stroke="#cbd5e0" rx="6" stroke-width="1.5" />
    <circle cx="105" cy="165" r="32" fill="#cbd5e0" />
    <circle cx="105" cy="155" r="18" fill="#718096" />
    <path d="M 85 190 Q 105 175 125 190" fill="#718096" />
    <text x="105" y="250" font-family="sans-serif" font-size="11" font-weight="bold" fill="#4a5568" text-anchor="middle">PHOTO VERIFIED</text>
    
    <!-- Details -->
    <g transform="translate(200, 125)" font-family="sans-serif">
      <text x="0" y="0" font-size="11" fill="#718096">नाम / Name</text>
      <text x="0" y="22" font-size="17" font-weight="bold" fill="#1a202c">${tutorName}</text>
      
      <text x="0" y="55" font-size="11" fill="#718096">जन्म तिथि / DOB</text>
      <text x="0" y="74" font-size="14" font-weight="600" fill="#2d3748">14/08/1996</text>
      
      <text x="0" y="105" font-size="11" fill="#718096">लिंग / Gender</text>
      <text x="0" y="124" font-size="14" font-weight="600" fill="#2d3748">Female / Male (Verified)</text>
      
      <text x="0" y="152" font-size="11" fill="#718096">पता / Address</text>
      <text x="0" y="170" font-size="12" font-weight="500" fill="#4a5568">${locality}, Rayagada, Odisha - 765001</text>
    </g>
    
    <!-- QR Code Graphic -->
    <rect x="540" y="130" width="110" height="110" fill="#f7fafc" stroke="#a0aec0" stroke-dasharray="2 2" />
    <rect x="555" y="145" width="25" height="25" fill="#1a202c" />
    <rect x="610" y="145" width="25" height="25" fill="#1a202c" />
    <rect x="555" y="200" width="25" height="25" fill="#1a202c" />
    <rect x="590" y="180" width="15" height="15" fill="#1a202c" />
    <text x="595" y="258" font-family="monospace" font-size="9" fill="#718096" text-anchor="middle">SECURE QR</text>
    
    <!-- Red Aadhaar Number Banner -->
    <rect x="40" y="325" width="620" height="55" fill="#fff5f5" rx="8" stroke="#feb2b2" stroke-width="1.5" />
    <text x="350" y="362" font-family="'Courier New', monospace" font-size="26" font-weight="bold" fill="#c53030" text-anchor="middle" letter-spacing="4">
      ${formattedAadhaar}
    </text>
    
    <!-- Slogan bottom -->
    <text x="350" y="415" font-family="sans-serif" font-size="12" font-weight="bold" fill="#2c5282" text-anchor="middle">
      मेरा आधार, मेरी पहचान (GOVERNMENT OF INDIA IDENTITY)
    </text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
