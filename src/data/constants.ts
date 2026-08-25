export const OCCASIONS = [
  { id: 'mother',     title: 'For Mother',          tagline: 'A tree that loves her back',              note: 'A living tribute that grows every monsoon.',              species: ['Mango', 'Neem'],          accent: '#C77B5C' },
  { id: 'memory',     title: 'In Memory',            tagline: 'Roots that remember',                     note: 'Honour someone you loved with shade and shelter.',         species: ['Peepal', 'Banyan'],       accent: '#7E8C5B' },
  { id: 'special',    title: 'For Someone Special',  tagline: 'A gift that keeps on growing',            note: 'Pick a tree, write a note, dedicate it forever.',          species: ['Gulmohar', 'Mango'],      accent: '#D4994A' },
  { id: 'newborn',    title: 'For a Newborn',        tagline: 'A sapling for a new life',                note: 'Plant a tree the same year a child is born.',              species: ['Neem', 'Drumstick'],      accent: '#A2B57E' },
  { id: 'anniversary',title: 'For Anniversary',      tagline: 'Two roots, one story',                    note: 'Mark the years with something that outlives them.',        species: ['Arjun', 'Mango'],         accent: '#B86A4F' },
  { id: 'festival',   title: 'For Festivals',        tagline: 'Diwali, Rakhi, Holi — gifts that grow',   note: 'A festival gift that quietly outlives the season.',        species: ['Gulmohar', 'Peepal'],     accent: '#D9A24E' },
  { id: 'corporate',  title: 'CSR & Corporate',      tagline: 'Forests for your team',                   note: 'Bulk plantations with photo and GPS reports.',             species: ['Mixed grove'],            accent: '#5C7A52' },
  { id: 'self',       title: 'For Yourself',         tagline: 'Plant the year you intend to remember',   note: 'A small private ritual on our farm.',                      species: ['Any species'],            accent: '#8C6F4B' },
]

export const SPECIES = [
  { id: 'neem',      name: 'Neem',      latin: 'Azadirachta indica', symbolism: 'Healing, protection',   life: '150–300 yrs', height: '15–20 m', native: true  },
  { id: 'mango',     name: 'Mango',     latin: 'Mangifera indica',   symbolism: 'Abundance, love',        life: '100+ yrs',   height: '12–18 m', native: true  },
  { id: 'peepal',    name: 'Peepal',    latin: 'Ficus religiosa',    symbolism: 'Wisdom, longevity',      life: '900+ yrs',   height: '20–30 m', native: true  },
  { id: 'banyan',    name: 'Banyan',    latin: 'Ficus benghalensis', symbolism: 'Memory, gathering',      life: '500+ yrs',   height: '20 m+',   native: true  },
  { id: 'drumstick', name: 'Drumstick', latin: 'Moringa oleifera',   symbolism: 'Nourishment, strength',  life: '20–30 yrs',  height: '10–12 m', native: true  },
  { id: 'gulmohar',  name: 'Gulmohar',  latin: 'Delonix regia',      symbolism: 'Joy, summer fire',       life: '40–50 yrs',  height: '10–12 m', native: false },
  { id: 'arjun',     name: 'Arjun',     latin: 'Terminalia arjuna',  symbolism: 'Strength of heart',      life: '100+ yrs',   height: '20–25 m', native: true  },
]

export const TESTIMONIALS = [
  { name: 'Aarti S.',        city: 'Mumbai',     occasion: 'For Mother',   text: "On Maa's 60th, instead of flowers that fade, I gave her a mango tree on the Kheda farm. Every month, a photo arrives. She forwards it to all her sisters." },
  { name: 'Rahul & Priya',   city: 'Bengaluru',  occasion: 'Anniversary',  text: 'Eight years, one peepal. We drove down last December and sat under our own tree. It is barely as tall as us — but it will outlive us, and that is the point.' },
  { name: 'The Mehta Family', city: 'Ahmedabad', occasion: 'In Memory',    text: 'After Papa passed, we did not want a plaque. We wanted shade. The team helped us pick a banyan and chose the spot. We visit every Diwali.' },
]

export const BLOG_POSTS = [
  { id: 'where-donation-goes', tag: 'Transparency', title: 'Where your tree donation really goes — a complete breakdown',    date: 'Apr 22, 2026', read: '7 min', excerpt: 'Of every ₹500, ₹312 reaches the soil. Here is the receipt — sapling, labour, three years of care, and the photo we take when it is taller than you.' },
  { id: 'matters-2026',        tag: 'Awareness',    title: 'Why tree plantation matters more than ever in 2026',              date: 'Apr 14, 2026', read: '5 min', excerpt: 'Gujarat lost 2.1% of canopy cover last decade. The math on what one tree gives back — and what a thousand can.' },
  { id: 'native-vs-non',       tag: 'Science',      title: 'Native vs non-native trees: what we plant and why',              date: 'Apr 02, 2026', read: '6 min', excerpt: 'Why 87% of what we plant is native to the Sabarmati basin — and the careful exceptions we make.' },
  { id: 'survival',            tag: 'Process',      title: 'Ensuring survival — what happens after a tree is planted',        date: 'Mar 18, 2026', read: '8 min', excerpt: 'Three years of mulching, irrigation, fencing and visits. The boring work that actually grows a forest.' },
  { id: 'community',           tag: 'People',       title: 'Meet the people behind the trees',                                date: 'Mar 04, 2026', read: '4 min', excerpt: 'Karsanbhai, Rinaben and the eleven others who walk the rows every morning at six.' },
  { id: 'gift-that-grows',     tag: 'Stories',      title: 'A gift that grows: why donating a tree is different',             date: 'Feb 21, 2026', read: '5 min', excerpt: 'Soap, sweets, candles, scarves. And then this — something that gets bigger, not smaller, with each year.' },
]

export const FAQS = [
  { q: 'Where exactly is the tree planted?',         a: 'On our 10-acre farm in Vasna village, Kheda district — about 55 km from Ahmedabad. Every tree gets a numbered marker and GPS coordinates linked to your dedication page.' },
  { q: 'Can I really visit my tree?',                a: 'Yes. The farm is open to dedicators every Saturday, 8 am – 5 pm. We will share the gate location and the row your tree is in. Bring water; we will provide chai.' },
  { q: 'What does ₹500 actually cover?',             a: 'Sapling, planting labour, three years of mulching and irrigation, the protective tree-guard, monthly photo updates, and the digital certificate with QR code.' },
  { q: 'What if my tree does not survive?',          a: 'In the rare case (we hold a 94% three-year survival rate), we replant a sapling of the same species at no cost and update your dedication with the new tree.' },
  { q: 'How are monthly photos delivered?',          a: 'On the 1st of every month, you receive a WhatsApp / email with a fresh photo and a short note from the team. They live on your tree page forever.' },
  { q: 'Do you accept corporate / CSR plantations?', a: 'Yes — bulk plantations from 100 to 50,000 trees with full reporting, branded certificates, and team visit days. Reach out via the CSR page.' },
]

export const LEVELS = [
  { n: 1, name: 'Seedling',        trees: 0   },
  { n: 2, name: 'Sapling',         trees: 1   },
  { n: 3, name: 'Sprout',          trees: 3   },
  { n: 4, name: 'Grove Keeper',    trees: 10  },
  { n: 5, name: 'Forest Steward',  trees: 20  },
  { n: 6, name: 'Canopy Guardian', trees: 50  },
  { n: 7, name: 'Ancient Tree',    trees: 100 },
]

export function getUserLevel(totalTrees: number) {
  let level = LEVELS[0]
  for (const l of LEVELS) {
    if (totalTrees >= l.trees) level = l
  }
  const idx = LEVELS.indexOf(level)
  const next = LEVELS[idx + 1] || null
  return { current: level, next }
}
