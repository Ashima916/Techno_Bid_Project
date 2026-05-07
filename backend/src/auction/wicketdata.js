const wicketdata = [
  {
    "id": 601,
    "name": "Rishabh Pant",
    "country": "India 🇮🇳",
    "age": 28,
    "role": "Wicket-Keeper Batter",
    "auctionPhase": "WICKET_KEEPER",
    "battingStyle": "Left-hand",
    "position": "Middle-order",
    "stats": {
      "matches": 125,
      "runs": 3300,
      "avg": 35,
      "sr": 148
    },
    "strengths": [
      "Explosive batting",
      "Match winner"
    ],
    "auction": {
      "base": 400,
      "overseas": false
    },
    "rank": 9.1,
    "image": "/BatterImages/players/pant.webp"
  },
  {
    "id": 602,
    "name": "KL Rahul",
    "country": "India 🇮🇳",
    "age": 33,
    "role": "Wicket-Keeper Batter",
    "auctionPhase": "WICKET_KEEPER",
    "battingStyle": "Right-hand",
    "position": "Opener",
    "stats": {
      "matches": 145,
      "runs": 4689,
      "avg": 44,
      "sr": 135
    },
    "strengths": [
      "Consistency",
      "Leadership"
    ],
    "auction": {
      "base": 400,
      "overseas": false
    },
    "rank": 9.3,
    "image": "/BatterImages/players/Rahul.jpg"
  },
  {
    "id": 603,
    "name": "Sanju Samson",
    "country": "India 🇮🇳",
    "age": 31,
    "role": "Wicket-Keeper Batter",
    "auctionPhase": "WICKET_KEEPER",
    "battingStyle": "Right-hand",
    "position": "Top-order",
    "stats": {
      "matches": 175,
      "runs": 4500,
      "avg": 30,
      "sr": 140
    },
    "strengths": [
      "Stroke play",
      "Boundary hitting"
    ],
    "auction": {
      "base": 300,
      "overseas": false
    },
    "rank": 8.7,
    "image": "/BatterImages/players/sanju.webp"
  },
  {
    "id": 604,
    "name": "Ishan Kishan",
    "country": "India 🇮🇳",
    "age": 27,
    "role": "Wicket-Keeper Batter",
    "auctionPhase": "WICKET_KEEPER",
    "battingStyle": "Left-hand",
    "position": "Opener",
    "stats": {
      "matches": 110,
      "runs": 2700,
      "avg": 28,
      "sr": 142
    },
    "strengths": [
      "Powerplay hitting"
    ],
    "auction": {
      "base": 300,
      "overseas": false
    },
    "rank": 8.5,
    "image": "/BatterImages/players/Ishan.jpg"
  },
  {
    "id": 605,
    "name": "Jos Buttler",
    "country": "England 🏴",
    "age": 35,
    "role": "Wicket-Keeper Batter",
    "auctionPhase": "WICKET_KEEPER",
    "battingStyle": "Right-hand",
    "position": "Opener",
    "stats": {
      "matches": 115,
      "runs": 4100,
      "avg": 38,
      "sr": 152
    },
    "strengths": [
      "Match winner",
      "Explosive starts"
    ],
    "auction": {
      "base": 400,
      "overseas": true
    },
    "rank": 9,
    "image": "/BatterImages/players/Jos.jpg"
  },
  {
    "id": 606,
    "name": "Jonny Bairstow",
    "country": "England 🏴",
    "age": 36,
    "role": "Wicket-Keeper Batter",
    "auctionPhase": "WICKET_KEEPER",
    "battingStyle": "Right-hand",
    "position": "Opener",
    "stats": {
      "matches": 75,
      "runs": 1800,
      "avg": 34,
      "sr": 142
    },
    "strengths": [
      "Aggressive batting"
    ],
    "auction": {
      "base": 200,
      "overseas": true
    },
    "rank": 7.7,
    "image": "/BatterImages/players/Jonny.jpg"
  },
  {
    "id": 607,
    "name": "Quinton de Kock",
    "country": "South Africa 🇿🇦",
    "age": 33,
    "role": "Wicket-Keeper Batter",
    "auctionPhase": "WICKET_KEEPER",
    "battingStyle": "Left-hand",
    "position": "Opener",
    "stats": {
      "matches": 115,
      "runs": 3300,
      "avg": 31,
      "sr": 138
    },
    "strengths": [
      "Fast starts"
    ],
    "auction": {
      "base": 300,
      "overseas": true
    },
    "rank": 8.9,
    "image": "/BatterImages/players/kock.jpg"
  },
  {
    "id": 608,
    "name": "Nicholas Pooran",
    "country": "West Indies 🇹🇹",
    "age": 30,
    "role": "Wicket-Keeper Batter",
    "auctionPhase": "WICKET_KEEPER",
    "battingStyle": "Left-hand",
    "position": "Finisher",
    "stats": {
      "matches": 110,
      "runs": 2800,
      "avg": 30,
      "sr": 162
    },
    "strengths": [
      "Power hitting"
    ],
    "auction": {
      "base": 300,
      "overseas": true
    },
    "rank": 8.2,
    "image": "/BatterImages/players/nicholas.webp"
  },
  {
    "id": 609,
    "name": "Heinrich Klaasen",
    "country": "South Africa 🇿🇦",
    "age": 34,
    "role": "Wicket-Keeper Batter",
    "auctionPhase": "WICKET_KEEPER",
    "battingStyle": "Right-hand",
    "position": "Middle-order",
    "stats": {
      "matches": 62,
      "runs": 1650,
      "avg": 36,
      "sr": 172
    },
    "strengths": [
      "Spin hitting"
    ],
    "auction": {
      "base": 300,
      "overseas": true
    },
    "rank": 8.9,
    "image": "/BatterImages/players/heinrich.jpg"
  },
  {
    "id": 610,
    "name": "Phil Salt",
    "country": "England 🏴",
    "age": 29,
    "role": "Wicket-Keeper Batter",
    "auctionPhase": "WICKET_KEEPER",
    "battingStyle": "Right-hand",
    "position": "Opener",
    "stats": {
      "matches": 45,
      "runs": 1350,
      "avg": 35,
      "sr": 165
    },
    "strengths": [
      "Explosive opener"
    ],
    "auction": {
      "base": 300,
      "overseas": true
    },
    "rank": 8.6,
    "image": "/BatterImages/players/Phil.jpg"
  },
  {
    "id": 611,
    "name": "Rahmanullah Gurbaz",
    "country": "Afghanistan 🇦🇫",
    "age": 24,
    "role": "Wicket-Keeper Batter",
    "auctionPhase": "WICKET_KEEPER",
    "battingStyle": "Right-hand",
    "position": "Opener",
    "stats": {
      "matches": 38,
      "runs": 850,
      "avg": 24,
      "sr": 141
    },
    "strengths": [
      "Fearless batting"
    ],
    "auction": {
      "base": 200,
      "overseas": true
    },
    "rank": 7.5,
    "image": "/BatterImages/players/Rahmanullah.jpg"
  },
  {
    "id": 612,
    "name": "Jitesh Sharma",
    "country": "India 🇮🇳",
    "age": 32,
    "role": "Wicket-Keeper",
    "auctionPhase": "WICKET_KEEPER",
    "battingStyle": "Right-hand",
    "position": "Finisher",
    "stats": {
      "matches": 48,
      "runs": 950,
      "sr": 154
    },
    "strengths": [
      "Death overs hitting"
    ],
    "auction": {
      "base": 200,
      "overseas": false
    },
    "rank": 7.8,
    "image": "/BatterImages/players/jitesh.jpg"
  },
  {
    "id": 613,
    "name": "Josh Inglis",
    "country": "Australia 🇦🇺",
    "age": 30,
    "role": "Wicket-Keeper",
    "auctionPhase": "WICKET_KEEPER",
    "battingStyle": "Right-hand",
    "position": "Top-order",
    "stats": {
      "matches": 25,
      "runs": 650,
      "sr": 151
    },
    "strengths": [
      "Aggressive intent"
    ],
    "auction": {
      "base": 200,
      "overseas": true
    },
    "rank": 7.7,
    "image": "/BatterImages/players/josh.png"
  },
  {
    "id": 614,
    "name": "Ben McDermott",
    "country": "Australia 🇦🇺",
    "age": 31,
    "role": "Wicket-Keeper",
    "auctionPhase": "WICKET_KEEPER",
    "battingStyle": "Right-hand",
    "position": "Top-order",
    "stats": {
      "matches": 28,
      "runs": 610,
      "sr": 132
    },
    "strengths": [
      "Powerplay hitting"
    ],
    "auction": {
      "base": 200,
      "overseas": true
    },
    "rank": 7.4,
    "image": "/BatterImages/players/ben_mcdermott.jpeg"
  },
  {
    "id": 615,
    "name": "Abishek Porel",
    "country": "India 🇮🇳",
    "age": 23,
    "role": "Wicket-Keeper",
    "auctionPhase": "WICKET_KEEPER",
    "battingStyle": "Left-hand",
    "position": "Middle-order",
    "stats": {
      "matches": 28,
      "runs": 550,
      "sr": 148
    },
    "strengths": [
      "Young prospect"
    ],
    "auction": {
      "base": 200,
      "overseas": false
    },
    "rank": 7,
    "image": "/BatterImages/players/abhishek_porel.webp"
  },
  {
    "id": 616,
    "name": "Kusal Mendis",
    "country": "Sri Lanka 🇱🇰",
    "age": 30,
    "role": "Wicket-Keeper",
    "auctionPhase": "WICKET_KEEPER",
    "battingStyle": "Right-hand",
    "position": "Top-order",
    "stats": {
      "matches": 65,
      "runs": 1650,
      "sr": 135
    },
    "strengths": [
      "Technically sound"
    ],
    "auction": {
      "base": 200,
      "overseas": true
    },
    "rank": 7.2,
    "image": "/BatterImages/players/Kusal.png"
  },
  {
    "id": 617,
    "name": "Wriddhiman Saha",
    "country": "India 🇮🇳",
    "age": 41,
    "role": "Wicket-Keeper Batter",
    "auctionPhase": "WICKET_KEEPER",
    "battingStyle": "Right-hand",
    "position": "Opener",
    "stats": {
      "matches": 172,
      "runs": 2950,
      "avg": 24,
      "sr": 128
    },
    "strengths": [
      "Wicketkeeping skills",
      "Experience"
    ],
    "auction": {
      "base": 300,
      "overseas": false
    },
    "rank": 8,
    "image": "/BatterImages/players/Wriddhiman.jpg"
  },
  {
    "id": 618,
    "name": "Anuj Rawat",
    "country": "India 🇮🇳",
    "age": 26,
    "role": "Wicket-Keeper Batter",
    "auctionPhase": "WICKET_KEEPER",
    "battingStyle": "Left-hand",
    "position": "Top-order",
    "stats": {
      "matches": 40,
      "runs": 780,
      "avg": 23,
      "sr": 132
    },
    "strengths": [
      "Aggressive batting",
      "Young talent"
    ],
    "auction": {
      "base": 50,
      "overseas": false
    },
    "rank": 5.8,
    "image": "/BatterImages/players/anuj.webp"
  },
  {
    "id": 619,
    "name": "KS Bharat",
    "country": "India 🇮🇳",
    "age": 32,
    "role": "Wicket-Keeper Batter",
    "auctionPhase": "WICKET_KEEPER",
    "battingStyle": "Right-hand",
    "position": "Middle-order",
    "stats": {
      "matches": 30,
      "runs": 450,
      "avg": 20,
      "sr": 118
    },
    "strengths": [
      "Reliable keeping",
      "Calm under pressure"
    ],
    "auction": {
      "base": 100,
      "overseas": false
    },
    "rank": 6.5,
    "image": "/BatterImages/players/Bharat.png"
  },
  {
    "id": 620,
    "name": "Dhruv Jurel",
    "country": "India 🇮🇳",
    "age": 25,
    "role": "Wicket-Keeper Batter",
    "auctionPhase": "WICKET_KEEPER",
    "battingStyle": "Right-hand",
    "position": "Middle-order",
    "stats": {
      "matches": 30,
      "runs": 650,
      "avg": 31,
      "sr": 142
    },
    "strengths": [
      "Composure",
      "Shot selection"
    ],
    "auction": {
      "base": 200,
      "overseas": false
    },
    "rank": 7.4,
    "image": "/BatterImages/players/Dhruv.jpg"
  },
  {
    "id": 621,
    "name": "Prabhsimran Singh",
    "country": "India 🇮🇳",
    "age": 25,
    "role": "Wicket-Keeper Batter",
    "auctionPhase": "WICKET_KEEPER",
    "battingStyle": "Right-hand",
    "position": "Opener",
    "stats": {
      "matches": 48,
      "runs": 1100,
      "avg": 24,
      "sr": 145
    },
    "strengths": [
      "Powerplay hitting",
      "Fearless approach"
    ],
    "auction": {
      "base": 300,
      "overseas": false
    },
    "rank": 8,
    "image": "/BatterImages/players/singh.webp"
  },
  {
    "id": 622,
    "name": "Alex Carey",
    "country": "Australia 🇦🇺",
    "age": 34,
    "role": "Wicket-Keeper Batter",
    "auctionPhase": "WICKET_KEEPER",
    "battingStyle": "Left-hand",
    "position": "Middle-order",
    "stats": {
      "matches": 92,
      "runs": 2400,
      "avg": 35.07,
      "sr": 128.67
    },
    "strengths": [
      "Reliable keeper",
      "Middle-order stability"
    ],
    "auction": {
      "base": 200,
      "overseas": true
    },
    "rank": 7.6,
    "image": "/BatterImages/players/alex.webp"
  },
  {
    "id": 623,
    "name": "MS Dhoni",
    "country": "India 🇮🇳",
    "age": 44,
    "role": "Wicket-Keeper Batter",
    "auctionPhase": "WICKET_KEEPER",
    "battingStyle": "Right-hand",
    "position": "Middle-order",
    "stats": {
      "matches": 264,
      "runs": 5243,
      "avg": 39.13,
      "sr": 137.5
    },
    "strengths": [
      "Finisher",
      "Captaincy",
      "Composure"
    ],
    "auction": {
      "base": 300,
      "overseas": false
    },
    "rank": 8.9,
    "image": "/BatterImages/players/dhoni.webp"
  },
  {
    "id": 624,
    "name": "Matthew Wade",
    "country": "Australia 🇦🇺",
    "age": 38,
    "role": "Wicket-Keeper Batter",
    "auctionPhase": "WICKET_KEEPER",
    "battingStyle": "Left-hand",
    "position": "Middle-order",
    "stats": {
      "matches": 105,
      "runs": 2100,
      "avg": 26.29,
      "sr": 142.59
    },
    "strengths": [
      "Explosive hitting",
      "T20 specialist"
    ],
    "auction": {
      "base": 200,
      "overseas": true
    },
    "rank": 7.6,
    "image": "/BatterImages/players/Matthew.jpg"
  }
];

module.exports = wicketdata;