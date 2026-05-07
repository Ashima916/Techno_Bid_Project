const playerdata = [
  {
    "id": 1,
    "name": "Virat Kohli",
    "country": "India 🇮🇳",
    "age": 37,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Top-order",
    "stats": {
      "matches": "260+",
      "runs": "8000+",
      "avg": 38,
      "sr": 132
    },
    "strengths": [
      "Chase master",
      "Consistency"
    ],
    "auction": {
      "base": 400,
      "marquee": true,
      "overseas": false
    },
    "leadership": "Former captain",
    "fitness": "Elite",
    "rank": 9.8,
    "image": "/BatterImages/players/virat.webp"
  },
  {
    "id": 2,
    "name": "Rohit Sharma",
    "country": "India 🇮🇳",
    "age": 38,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Opener",
    "stats": {
      "matches": "270+",
      "runs": "7000+",
      "avg": 30,
      "sr": 131
    },
    "strengths": [
      "Powerplay hitting"
    ],
    "auction": {
      "base": 400,
      "marquee": true,
      "overseas": false
    },
    "leadership": "Successful captain",
    "fitness": "Good",
    "rank": 9.8,
    "image": "/BatterImages/players/rohit-sharma.jpg"
  },
  {
    "id": 3,
    "name": "Shubman Gill",
    "country": "India 🇮🇳",
    "age": 26,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Opener",
    "stats": {
      "matches": "105+",
      "runs": "3800+",
      "avg": 39,
      "sr": 138
    },
    "strengths": [
      "Technique",
      "Timing"
    ],
    "auction": {
      "base": 400,
      "marquee": false,
      "overseas": false
    },
    "fitness": "Excellent",
    "rank": 9.2,
    "image": "/BatterImages/players/subham.jpg"
  },
  {
    "id": 4,
    "name": "Suryakumar Yadav",
    "country": "India 🇮🇳",
    "age": 35,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Middle-order",
    "stats": {
      "matches": "160+",
      "runs": "3600+",
      "avg": 35,
      "sr": 150
    },
    "strengths": [
      "360° shots"
    ],
    "auction": {
      "base": 400,
      "overseas": false
    },
    "fitness": "Excellent",
    "rank": 9.2,
    "image": "/BatterImages/players/suryakumar.avif"
  },
  {
    "id": 5,
    "name": "Ruturaj Gaikwad",
    "country": "India 🇮🇳",
    "age": 29,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Opener",
    "stats": {
      "matches": "71",
      "runs": "2500+",
      "avg": 39,
      "sr": 136
    },
    "strengths": [
      "Calm",
      "Consistency"
    ],
    "auction": {
      "base": 300,
      "overseas": false
    },
    "rank": 8.2,
    "image": "/BatterImages/players/ruturaj.avif"
  },
  {
    "id": 6,
    "name": "Yashasvi Jaiswal",
    "country": "India 🇮🇳",
    "age": 24,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Left-hand",
    "position": "Opener",
    "stats": {
      "matches": "67",
      "runs": "2200+",
      "avg": 34,
      "sr": 155
    },
    "strengths": [
      "Aggressive starts"
    ],
    "auction": {
      "base": 300,
      "overseas": false
    },
    "rank": 8.7,
    "image": "/BatterImages/players/jaiswal.webp"
  },
  {
    "id": 7,
    "name": "Shreyas Iyer",
    "country": "India 🇮🇳",
    "age": 31,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Middle-order",
    "stats": {
      "matches": "130",
      "runs": "3600+",
      "avg": 34,
      "sr": 133
    },
    "strengths": [
      "Spin hitter"
    ],
    "auction": {
      "base": 300,
      "overseas": false
    },
    "leadership": "Captain",
    "rank": 8.9,
    "image": "/BatterImages/players/shreyas.webp"
  },
  {
    "id": 8,
    "name": "Prithvi Shaw",
    "country": "India 🇮🇳",
    "age": 26,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Opener",
    "stats": {
      "matches": "78",
      "runs": "1900+",
      "avg": 23,
      "sr": 142
    },
    "strengths": [
      "Explosive powerplay"
    ],
    "auction": {
      "base": 100,
      "overseas": false
    },
    "rank": 6,
    "image": "/bowlers/prithvi.avif"
  },
  {
    "id": 9,
    "name": "Devdutt Padikkal",
    "country": "India 🇮🇳",
    "age": 25,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Left-hand",
    "position": "Top-order",
    "stats": {
      "matches": "70 +",
      "runs": "1800+",
      "avg": 25,
      "sr": 126
    },
    "strengths": [
      "Elegant timing"
    ],
    "auction": {
      "base": 200,
      "overseas": false
    },
    "rank": 7.3,
    "image": "/BatterImages/players/devdutt.avif"
  },
  {
    "id": 10,
    "name": "Kane Williamson",
    "country": "New Zealand 🇳🇿",
    "age": 35,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Top-order",
    "stats": {
      "matches": "70 +",
      "runs": "2300+",
      "avg": 35,
      "sr": 125
    },
    "strengths": [
      "Anchor role"
    ],
    "auction": {
      "base": 200,
      "overseas": true
    },
    "rank": 7.6,
    "image": "/BatterImages/players/kane.avif"
  },
  {
    "id": 11,
    "name": "Steve Smith",
    "country": "Australia 🇦🇺",
    "age": 36,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Middle-order",
    "stats": {
      "matches": "100+",
      "runs": "2600+",
      "avg": 34,
      "sr": 128
    },
    "strengths": [
      "Technique"
    ],
    "auction": {
      "base": 200,
      "overseas": true
    },
    "rank": 7,
    "image": "/BatterImages/players/steve.webp"
  },
  {
    "id": 12,
    "name": "Rinku Singh",
    "country": "India 🇮🇳",
    "age": 28,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Left-hand",
    "position": "Finisher",
    "stats": {
      "matches": "50 +",
      "runs": "1000+",
      "avg": 30,
      "sr": 150
    },
    "strengths": [
      "Finishing matches"
    ],
    "auction": {
      "base": 300,
      "overseas": false
    },
    "rank": 8,
    "image": "/BatterImages/players/rinku.avif"
  },
  {
    "id": 13,
    "name": "Tilak Varma",
    "country": "India 🇮🇳",
    "age": 23,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Left-hand",
    "position": "Middle-order",
    "stats": {
      "matches": "50 +",
      "runs": "1400+",
      "avg": 36,
      "sr": 144
    },
    "strengths": [
      "Calm under pressure"
    ],
    "auction": {
      "base": 300,
      "overseas": false
    },
    "rank": 8.5,
    "image": "/BatterImages/players/tilak.avif"
  },
  {
    "id": 14,
    "name": "Abhishek Sharma",
    "country": "India 🇮🇳",
    "age": 25,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Left-hand",
    "position": "Opener",
    "stats": {
      "matches": "70 +",
      "runs": "1700+",
      "avg": 27,
      "sr": 160
    },
    "strengths": [
      "Powerplay hitter"
    ],
    "auction": {
      "base": 300,
      "overseas": false
    },
    "rank": 8.8,
    "image": "/BatterImages/players/abhishek_sharma.webp"
  },
  {
    "id": 15,
    "name": "Mayank Agarwal",
    "country": "India 🇮🇳",
    "age": 35,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Opener",
    "stats": {
      "matches": "120 +",
      "runs": "2800+",
      "avg": 23,
      "sr": 133
    },
    "strengths": [
      "Fast starts"
    ],
    "auction": {
      "base": 100,
      "overseas": false
    },
    "rank": 6.9,
    "image": "/BatterImages/players/mayank.jpg"
  },
  {
    "id": 16,
    "name": "Manish Pandey",
    "country": "India 🇮🇳",
    "age": 36,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Middle-order",
    "stats": {
      "matches": "170 +",
      "runs": "3900+",
      "avg": 29,
      "sr": 121
    },
    "strengths": [
      "Experience"
    ],
    "auction": {
      "base": 100,
      "overseas": false
    },
    "rank": 6.4,
    "image": "/BatterImages/players/manish.webp"
  },
  {
    "id": 17,
    "name": "Rahul Tripathi",
    "country": "India 🇮🇳",
    "age": 35,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Top-order",
    "stats": {
      "matches": "100",
      "runs": "2200+",
      "avg": 26,
      "sr": 138
    },
    "strengths": [
      "Quick scoring"
    ],
    "auction": {
      "base": 100,
      "overseas": false
    },
    "rank": 6.8,
    "image": "/BatterImages/players/rahul.png"
  },
  {
    "id": 19,
    "name": "Sai Sudharsan",
    "country": "India 🇮🇳",
    "age": 24,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Left-hand",
    "position": "Top-order",
    "stats": {
      "matches": "45+",
      "runs": "1600+",
      "avg": 49,
      "sr": 145
    },
    "strengths": [
      "Compact technique",
      "Consistency"
    ],
    "auction": {
      "base": 300,
      "overseas": false
    },
    "fitness": "Excellent",
    "rank": 8.3,
    "image": "/BatterImages/players/sai-sudharsan.jpg"
  },
  {
    "id": 20,
    "name": "Ayush Badoni",
    "country": "India 🇮🇳",
    "age": 26,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Middle-order",
    "stats": {
      "matches": "45+",
      "runs": "900+",
      "sr": 136,
      "avg": 26
    },
    "strengths": [
      "Calm under pressure",
      "Shot selection"
    ],
    "auction": {
      "base": 100,
      "overseas": false
    },
    "fitness": "Good",
    "rank": 6.4,
    "image": "/BatterImages/players/badoni.jpg"
  },
  {
    "id": 21,
    "name": "Harry Brook",
    "country": "England 🏴",
    "age": 27,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Middle-order",
    "stats": {
      "matches": "11+",
      "runs": "100+",
      "sr": 125
    },
    "strengths": [
      "Explosive batting",
      "Fearless approach"
    ],
    "auction": {
      "base": 200,
      "overseas": true
    },
    "fitness": "Excellent",
    "rank": 7.2,
    "image": "/BatterImages/players/harry.webp"
  },
  {
    "id": 22,
    "name": "Shai Hope",
    "country": "West Indies 🇯🇲",
    "age": 32,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Top-order",
    "stats": {
      "runs": "180 +",
      "avg": 31
    },
    "strengths": [
      "Technique",
      "Patience"
    ],
    "auction": {
      "base": 100,
      "overseas": true,
      "marquee": false
    },
    "fitness": "Good",
    "rank": 6.5,
    "image": "/BatterImages/players/shai-hope.jpg"
  },
  {
    "id": 23,
    "name": "Will Jacks",
    "country": "England 🏴",
    "age": 27,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Top-order",
    "stats": {
      "runs": "400+",
      "avg": 72,
      "sr": 160
    },
    "strengths": [
      "Aggressive approach"
    ],
    "auction": {
      "base": 300,
      "overseas": true,
      "marquee": false
    },
    "fitness": "Excellent",
    "rank": 8.5,
    "image": "/BatterImages/players/will-jacks.avif"
  },
  {
    "id": 24,
    "name": "Aiden Markram",
    "country": "South Africa 🇿🇦",
    "age": 31,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Middle-order",
    "stats": {
      "runs": "1400+",
      "avg": 31,
      "sr": 135
    },
    "strengths": [
      "Calm leadership",
      "Consistency"
    ],
    "auction": {
      "base": 300,
      "overseas": true,
      "marquee": false
    },
    "fitness": "Good",
    "rank": 8.4,
    "image": "/BatterImages/players/aiden-markram.webp"
  },
  {
    "id": 25,
    "name": "Travis Head",
    "country": "Australia 🇦🇺",
    "age": 32,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Left-hand",
    "position": "Opener",
    "stats": {
      "matches": "30+",
      "runs": "1600+",
      "avg": 34,
      "sr": 175
    },
    "strengths": [
      "Fearless powerplay",
      "Fast scoring"
    ],
    "auction": {
      "base": 300,
      "overseas": true
    },
    "fitness": "Excellent",
    "rank": 8.8,
    "image": "/BatterImages/players/Travis.png"
  },
  {
    "id": 26,
    "name": "Daryl Mitchell",
    "country": "New Zealand 🇳🇿",
    "age": 34,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Middle-order",
    "stats": {
      "matches": "40+",
      "runs": "1100",
      "avg": 27,
      "sr": 140
    },
    "strengths": [
      "All-condition adaptability",
      "Finishing ability"
    ],
    "auction": {
      "base": 300,
      "overseas": true
    },
    "fitness": "Good",
    "rank": 8.2,
    "image": "/BatterImages/players/darly.webp"
  },
  {
    "id": 27,
    "name": "Tim David",
    "country": "Australia 🇦🇺",
    "age": 29,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Finisher",
    "stats": {
      "matches": "55+",
      "runs": "800+",
      "avg": 32,
      "sr": 168
    },
    "strengths": [
      "Big sixes",
      "Death overs"
    ],
    "auction": {
      "base": 300,
      "overseas": true
    },
    "fitness": "Good",
    "rank": 8.7,
    "image": "/BatterImages/players/Tim.png"
  },
  {
    "id": 28,
    "name": "Nehal Wadhera",
    "country": "India 🇮🇳",
    "age": 25,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Left-hand",
    "position": "Middle-order",
    "stats": {
      "matches": "35+",
      "runs": "800+",
      "sr": 138,
      "avg": 26
    },
    "strengths": [
      "Spin hitting",
      "Composure"
    ],
    "auction": {
      "base": 100,
      "overseas": false
    },
    "fitness": "Good",
    "rank": 6.7,
    "image": "/BatterImages/players/Nehal.png"
  },
  {
    "id": 29,
    "name": "Shahrukh Khan",
    "country": "India 🇮🇳",
    "age": 30,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Finisher",
    "stats": {
      "matches": "55+",
      "runs": "850+",
      "sr": 146,
      "avg": 21
    },
    "strengths": [
      "Raw power",
      "Lower-order hitting"
    ],
    "auction": {
      "base": 100,
      "overseas": false
    },
    "fitness": "Good",
    "rank": 6.8,
    "image": "/BatterImages/players/Shahrukh.png"
  },
  {
    "id": 30,
    "name": "Ben Duckett",
    "country": "England 🏴",
    "age": 31,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Left-hand",
    "position": "Top-order",
    "stats": {
      "matches": "25+",
      "runs": "600+",
      "sr": 142
    },
    "strengths": [
      "Sweep shots",
      "Spin handling"
    ],
    "auction": {
      "base": 300,
      "overseas": true
    },
    "fitness": "Excellent",
    "rank": 8,
    "image": "/BatterImages/players/ben_ducket.jpg"
  },
  {
    "id": 31,
    "name": "Dewald Brevis",
    "country": "South Africa 🇿🇦",
    "age": 22,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Top-order",
    "stats": {
      "matches": "25+",
      "runs": "550+",
      "sr": 148
    },
    "strengths": [
      "Baby AB shots",
      "Fearless batting"
    ],
    "auction": {
      "base": 300,
      "overseas": true
    },
    "fitness": "Excellent",
    "rank": 8.2,
    "image": "/BatterImages/players/Dewald.png"
  },
  {
    "id": 32,
    "name": "Glenn Phillips",
    "country": "New Zealand 🇳🇿",
    "age": 29,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Middle-order",
    "stats": {
      "matches": "60+",
      "runs": "1800+",
      "avg": 32,
      "sr": 150
    },
    "strengths": [
      "Power hitting",
      "Fielding"
    ],
    "auction": {
      "base": 200,
      "overseas": true
    },
    "fitness": "Excellent",
    "rank": 7.8,
    "image": "/BatterImages/players/glenn.avif"
  },
  {
    "id": 33,
    "name": "Nitish Rana",
    "country": "India 🇮🇳",
    "age": 32,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Left-hand",
    "position": "Middle-order",
    "stats": {
      "matches": "100+",
      "runs": "2500+",
      "avg": 28,
      "sr": 134
    },
    "strengths": [
      "Spin hitting"
    ],
    "auction": {
      "base": 200,
      "overseas": false
    },
    "rank": 7.8,
    "image": "/BatterImages/players/nitish.jpg"
  },
  {
    "id": 34,
    "name": "Sarfaraz Khan",
    "country": "India 🇮🇳",
    "age": 28,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Middle-order",
    "stats": {
      "matches": "50+",
      "runs": "1200+",
      "avg": 35,
      "sr": 128
    },
    "strengths": [
      "Domestic dominance"
    ],
    "auction": {
      "base": 100,
      "overseas": false
    },
    "rank": 6.8,
    "image": "/BatterImages/players/sarfaraz.webp"
  },
  {
    "id": 35,
    "name": "Rajat Patidar",
    "country": "India 🇮🇳",
    "age": 32,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Top-order",
    "stats": {
      "matches": "40+",
      "runs": "1200+",
      "avg": 34,
      "sr": 145
    },
    "strengths": [
      "Spin hitter"
    ],
    "auction": {
      "base": 200,
      "overseas": false
    },
    "rank": 7.7,
    "image": "/BatterImages/players/rajat.webp"
  },
  {
    "id": 36,
    "name": "Ajinkya Rahane",
    "country": "India 🇮🇳",
    "age": 37,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Top-order",
    "stats": {
      "matches": "170+",
      "runs": "4600+",
      "avg": 31,
      "sr": 123
    },
    "strengths": [
      "Technique",
      "Experience"
    ],
    "auction": {
      "base": 200,
      "overseas": false
    },
    "rank": 7.4,
    "image": "/BatterImages/players/rahane.jpg"
  },
  {
    "id": 37,
    "name": "Shimron Hetmyer",
    "country": "West Indies 🇯🇲",
    "age": 2,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Left-hand",
    "position": "Finisher",
    "stats": {
      "matches": "60+",
      "runs": "1500+",
      "avg": 30,
      "sr": 155
    },
    "strengths": [
      "Six hitting"
    ],
    "auction": {
      "base": 200,
      "overseas": true
    },
    "rank": 7.7,
    "image": "/BatterImages/players/shimron.avif"
  },
  {
    "id": 38,
    "name": "David Miller",
    "country": "South Africa 🇿🇦",
    "age": 36,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Left-hand",
    "position": "Finisher",
    "stats": {
      "matches": "130+",
      "runs": "2700+",
      "avg": 34,
      "sr": 140
    },
    "strengths": [
      "Big hitting"
    ],
    "auction": {
      "base": 300,
      "overseas": true
    },
    "rank": 8.3,
    "image": "/BatterImages/players/david.avif"
  },
  {
    "id": 39,
    "name": "Finn Allen",
    "country": "New Zealand 🇳🇿",
    "age": 26,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Opener",
    "stats": {
      "matches": "40+",
      "runs": "1200+",
      "avg": 30,
      "sr": 165
    },
    "strengths": [
      "Aggressive starts"
    ],
    "auction": {
      "base": 200,
      "overseas": true
    },
    "rank": 7.3,
    "image": "/BatterImages/players/finn.avif"
  },
  {
    "id": 40,
    "name": "Karun Nair",
    "country": "India 🇮🇳",
    "age": 34,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Top-order",
    "stats": {
      "matches": "80+",
      "runs": "1600+",
      "avg": 24,
      "sr": 120
    },
    "strengths": [
      "Technique"
    ],
    "auction": {
      "base": 100,
      "overseas": false
    },
    "rank": 6.4,
    "image": "/BatterImages/players/karun.webp"
  },
  {
    "id": 41,
    "name": "Jacob Bethell",
    "country": "England 🏴",
    "age": 22,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Left-hand",
    "position": "Middle-order",
    "stats": {
      "matches": "10+",
      "runs": "200+",
      "avg": 20,
      "sr": 130
    },
    "strengths": [
      "Young talent"
    ],
    "auction": {
      "base": 200,
      "overseas": true
    },
    "rank": 7.5,
    "image": "/BatterImages/players/jacob.webp"
  },
  {
    "id": 42,
    "name": "Jake Fraser McGurk",
    "country": "Australia 🇦🇺",
    "age": 23,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Opener",
    "stats": {
      "matches": "10+",
      "runs": "300+",
      "avg": 28,
      "sr": 170
    },
    "strengths": [
      "Fearless batting"
    ],
    "auction": {
      "base": 100,
      "overseas": true
    },
    "rank": 6.7,
    "image": "/BatterImages/players/jake.avif"
  },
  {
    "id": 43,
    "name": "Vaibhav Suryavanshi",
    "country": "India 🇮🇳",
    "age": 14,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Top-order",
    "stats": {
      "matches": "5+",
      "runs": "150+",
      "avg": 30,
      "sr": 140
    },
    "strengths": [
      "Young prodigy"
    ],
    "auction": {
      "base": 200,
      "overseas": false
    },
    "rank": 7.2,
    "image": "/BatterImages/players/vaibhav.jpg"
  },
  {
    "id": 44,
    "name": "Ayush Matre",
    "country": "India 🇮🇳",
    "age": 18,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Middle-order",
    "stats": {
      "matches": "5+",
      "runs": "120+",
      "avg": 24,
      "sr": 130
    },
    "strengths": [
      "Domestic youth"
    ],
    "auction": {
      "base": 200,
      "overseas": false
    },
    "rank": 7,
    "image": "/BatterImages/players/ayush_matre.webp"
  },
  {
    "id": 45,
    "name": "Riyan Parag",
    "country": "India 🇮🇳",
    "age": 24,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Middle-order",
    "stats": {
      "matches": "60+",
      "runs": "1200+",
      "avg": 28,
      "sr": 140
    },
    "strengths": [
      "All-round batting"
    ],
    "auction": {
      "base": 300,
      "overseas": false
    },
    "rank": 8,
    "image": "/BatterImages/players/riyan.avif"
  },
  {
    "id": 46,
    "name": "Yash Dhull",
    "country": "India 🇮🇳",
    "age": 23,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Top-order",
    "stats": {
      "matches": "20+",
      "runs": "600+",
      "avg": 35,
      "sr": 130
    },
    "strengths": [
      "U19 Captain"
    ],
    "auction": {
      "base": 50,
      "overseas": false
    },
    "rank": 5.8,
    "image": "/BatterImages/players/yash.jpg"
  },
  {
    "id": 47,
    "name": "Sameer Rizvi",
    "country": "India 🇮🇳",
    "age": 22,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Middle-order",
    "stats": {
      "matches": "15+",
      "runs": "400+",
      "avg": 26,
      "sr": 150
    },
    "strengths": [
      "Power hitter"
    ],
    "auction": {
      "base": 100,
      "overseas": false
    },
    "rank": 6.5,
    "image": "/BatterImages/players/sameer.avif"
  },
  {
    "id": 48,
    "name": "Rachin Ravindra",
    "country": "New Zealand 🇳🇿",
    "age": 26,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Left-hand",
    "position": "Top-order",
    "stats": {
      "matches": "50+",
      "runs": "1500+",
      "avg": 32,
      "sr": 135
    },
    "strengths": [
      "All-round talent"
    ],
    "auction": {
      "base": 200,
      "overseas": true
    },
    "rank": 7.5,
    "image": "/BatterImages/players/rachin.webp"
  },
  {
    "id": 49,
    "name": "Harnoor Pannu",
    "country": "India 🇮🇳",
    "age": 22,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Top-order",
    "stats": {
      "matches": "10+",
      "runs": "300+",
      "avg": 30,
      "sr": 125
    },
    "strengths": [
      "U19 experience"
    ],
    "auction": {
      "base": 50,
      "overseas": false
    },
    "rank": 5.3,
    "image": "/BatterImages/players/harnoor.webp"
  },
  {
    "id": 50,
    "name": "Shashank Singh",
    "country": "India 🇮🇳",
    "age": 34,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Middle-order",
    "stats": {
      "matches": "40+",
      "runs": "600+",
      "avg": 20,
      "sr": 140
    },
    "strengths": [
      "Power hitter"
    ],
    "auction": {
      "base": 200,
      "overseas": false
    },
    "rank": 7.5,
    "image": "/BatterImages/players/shashank.webp"
  },
  {
    "id": 51,
    "name": "Angkrish Raghuvanshi",
    "country": "India 🇮🇳",
    "age": 21,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Top-order",
    "stats": {
      "matches": "5+",
      "runs": "150+",
      "avg": 30,
      "sr": 130
    },
    "strengths": [
      "U19 World Cup"
    ],
    "auction": {
      "base": 100,
      "overseas": false
    },
    "rank": 6.6,
    "image": "/BatterImages/players/angkrish.jpg"
  },
  {
    "id": 52,
    "name": "Shubham Dubey",
    "country": "India 🇮🇳",
    "age": 31,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Left-hand",
    "position": "Middle-order",
    "stats": {
      "matches": "20+",
      "runs": "300+",
      "avg": 20,
      "sr": 140
    },
    "strengths": [
      "Finisher"
    ],
    "auction": {
      "base": 100,
      "overseas": false
    },
    "rank": 6,
    "image": "/BatterImages/players/dubey.avif"
  },
  {
    "id": 53,
    "name": "Himmat Singh",
    "country": "India 🇮🇳",
    "age": 29,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Middle-order",
    "stats": {
      "matches": "30+",
      "runs": "500+",
      "avg": 22,
      "sr": 130
    },
    "strengths": [
      "Domestic experience"
    ],
    "auction": {
      "base": 50,
      "overseas": false
    },
    "rank": 5.2,
    "image": "/BatterImages/players/himmat.jpg"
  },
  {
    "id": 54,
    "name": "Pyla Avinash",
    "country": "India 🇮🇳",
    "age": 25,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Opener",
    "stats": {
      "matches": "15+",
      "runs": "350+",
      "avg": 25,
      "sr": 140
    },
    "strengths": [
      "Aggressive opener"
    ],
    "auction": {
      "base": 50,
      "overseas": false
    },
    "rank": 5.2,
    "image": "/BatterImages/players/pyla.webp"
  },
  {
    "id": 55,
    "name": "Ashutosh Sharma",
    "country": "India 🇮🇳",
    "age": 27,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Finisher",
    "stats": {
      "matches": "20+",
      "runs": "400+",
      "avg": 28,
      "sr": 155
    },
    "strengths": [
      "Big hitting"
    ],
    "auction": {
      "base": 200,
      "overseas": false
    },
    "rank": 7.3,
    "image": "/BatterImages/players/ashutosh.webp"
  },
  {
    "id": 56,
    "name": "Naman Dhir",
    "country": "India 🇮🇳",
    "age": 26,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Middle-order",
    "stats": {
      "matches": "10+",
      "runs": "200+",
      "avg": 20,
      "sr": 135
    },
    "strengths": [
      "Domestic talent"
    ],
    "auction": {
      "base": 100,
      "overseas": false
    },
    "rank": 6.4,
    "image": "/BatterImages/players/naman_dhir.webp"
  },
  {
    "id": 57,
    "name": "Priyansh Arya",
    "country": "India 🇮🇳",
    "age": 25,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Left-hand",
    "position": "Top-order",
    "stats": {
      "matches": "15+",
      "runs": "350+",
      "avg": 30,
      "sr": 145
    },
    "strengths": [
      "Aggressive batting"
    ],
    "auction": {
      "base": 200,
      "overseas": false
    },
    "rank": 7,
    "image": "/BatterImages/players/priyansh.jpg"
  },
  {
    "id": 58,
    "name": "Sahil Parakh",
    "country": "India 🇮🇳",
    "age": 17,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Middle-order",
    "stats": {
      "matches": "5+",
      "runs": "120+",
      "avg": 24,
      "sr": 130
    },
    "strengths": [
      "Domestic youth"
    ],
    "auction": {
      "base": 50,
      "overseas": false
    },
    "rank": 5,
    "image": "/BatterImages/players/sahil.webp"
  },
  {
    "id": 59,
    "name": "Shaik Rasheed",
    "country": "India 🇮🇳",
    "age": 20,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Right-hand",
    "position": "Top-order",
    "stats": {
      "matches": "10+",
      "runs": "250+",
      "avg": 30,
      "sr": 120
    },
    "strengths": [
      "U19 World Cup"
    ],
    "auction": {
      "base": 50,
      "overseas": false
    },
    "rank": 5.2,
    "image": "/BatterImages/players/shaik.webp"
  },
  {
    "id": 60,
    "name": "Musheer Khan",
    "country": "India 🇮🇳",
    "age": 20,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Left-hand",
    "position": "Middle-order",
    "stats": {
      "matches": "5+",
      "runs": "150+",
      "avg": 30,
      "sr": 125
    },
    "strengths": [
      "U19 talent"
    ],
    "auction": {
      "base": 50,
      "overseas": false
    },
    "rank": 5.8,
    "image": "/BatterImages/players/musheer.jpg"
  },
  {
    "id": 61,
    "name": "Sherfane Rutherford",
    "country": "West Indies 🇯🇲",
    "age": 27,
    "role": "Batter",
    "auctionPhase": "BATTERS",
    "battingStyle": "Left-hand",
    "position": "Finisher",
    "stats": {
      "matches": "40+",
      "runs": "900+",
      "avg": 25,
      "sr": 150
    },
    "strengths": [
      "Power hitting"
    ],
    "auction": {
      "base": 100,
      "overseas": true
    },
    "rank": 6.8,
    "image": "/BatterImages/players/sherfane.jpg"
  }
];

module.exports = playerdata;