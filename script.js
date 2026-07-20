const coarsePointer = window.matchMedia('(pointer: coarse)').matches
const revealItems = document.querySelectorAll('.reveal-on-scroll')
if (coarsePointer) {
  revealItems.forEach((item) => item.classList.add('visible'))
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        revealObserver.unobserve(entry.target)
      }
    })
  }, { threshold: 0.12 })
  revealItems.forEach((item) => revealObserver.observe(item))
}

const weddingDate = new Date('2026-11-21T11:00:00+05:30').getTime()
const countdownElements = {
  days: document.getElementById('days'),
  hours: document.getElementById('hours'),
  minutes: document.getElementById('minutes'),
  seconds: document.getElementById('seconds'),
}

function updateCountdown() {
  const difference = Math.max(0, weddingDate - Date.now())
  const day = 1000 * 60 * 60 * 24
  countdownElements.days.textContent = String(Math.floor(difference / day)).padStart(3, '0')
  countdownElements.hours.textContent = String(Math.floor((difference % day) / (1000 * 60 * 60))).padStart(2, '0')
  countdownElements.minutes.textContent = String(Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0')
  countdownElements.seconds.textContent = String(Math.floor((difference % (1000 * 60)) / 1000)).padStart(2, '0')
}
updateCountdown()
setInterval(updateCountdown, 1000)

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const fireworkCanvas = document.getElementById('fireworkTrail')
const fireworkContext = fireworkCanvas.getContext('2d')
const sparks = []
const fireworkRings = []
const sparkColors = ['#ffd166', '#ff9f1c', '#ff5d73', '#f7e7a9', '#e64d78']
let lastBurst = 0
let pixelRatio = 1
let fireworkFrame = null
let canvasCssWidth = 0

function resizeFireworkCanvas() {
  if (coarsePointer || reduceMotion) return
  if (coarsePointer && canvasCssWidth === window.innerWidth) return
  canvasCssWidth = window.innerWidth
  pixelRatio = coarsePointer ? 1 : Math.min(window.devicePixelRatio || 1, 1.5)
  fireworkCanvas.width = window.innerWidth * pixelRatio
  fireworkCanvas.height = window.innerHeight * pixelRatio
  fireworkCanvas.style.width = `${window.innerWidth}px`
  fireworkCanvas.style.height = `${window.innerHeight}px`
  fireworkContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
}

function burst(x, y, amount = 7, power = 1) {
  if (reduceMotion || coarsePointer) return
  for (let index = 0; index < amount; index += 1) {
    const angle = Math.random() * Math.PI * 2
    const speed = (1.2 + Math.random() * 2.7) * power
    sparks.push({
      x, y, previousX: x, previousY: y,
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed,
      color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
      life: 1,
      decay: (coarsePointer ? .04 : .024) + Math.random() * (coarsePointer ? .025 : .022),
      size: 2.4 + Math.random() * 3.8,
    })
  }
  if (power > 1.2) {
    fireworkRings.push({ x, y, radius: 5, life: 1, color: sparkColors[Math.floor(Math.random() * sparkColors.length)] })
  }
  const particleLimit = coarsePointer ? 110 : 280
  if (sparks.length > particleLimit) sparks.splice(0, sparks.length - particleLimit)
  requestFireworkFrame()
}

function requestFireworkFrame() {
  if (fireworkFrame === null) fireworkFrame = requestAnimationFrame(animateFireworks)
}

function animateFireworks() {
  fireworkFrame = null
  fireworkContext.clearRect(0, 0, window.innerWidth, window.innerHeight)
  fireworkContext.globalCompositeOperation = 'lighter'
  for (let index = sparks.length - 1; index >= 0; index -= 1) {
    const spark = sparks[index]
    spark.previousX = spark.x
    spark.previousY = spark.y
    spark.x += spark.velocityX
    spark.y += spark.velocityY
    spark.velocityX *= .985
    spark.velocityY = spark.velocityY * .985 + .025
    spark.life -= spark.decay
    if (spark.life <= 0) { sparks.splice(index, 1); continue }

    fireworkContext.beginPath()
    fireworkContext.arc(spark.x, spark.y, spark.size * spark.life, 0, Math.PI * 2)
    fireworkContext.fillStyle = spark.color
    fireworkContext.globalAlpha = spark.life
    fireworkContext.shadowColor = spark.color
    fireworkContext.shadowBlur = coarsePointer ? 0 : 7
    fireworkContext.fill()
  }
  fireworkContext.shadowBlur = 0
  for (let index = fireworkRings.length - 1; index >= 0; index -= 1) {
    const ring = fireworkRings[index]
    ring.radius += 2.8
    ring.life -= .035
    if (ring.life <= 0) { fireworkRings.splice(index, 1); continue }
    fireworkContext.beginPath()
    fireworkContext.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2)
    fireworkContext.strokeStyle = ring.color
    fireworkContext.lineWidth = 2.5 * ring.life
    fireworkContext.globalAlpha = ring.life * .7
    fireworkContext.stroke()
  }
  fireworkContext.globalAlpha = 1
  if (sparks.length || fireworkRings.length) requestFireworkFrame()
}

if (coarsePointer || reduceMotion) {
  fireworkCanvas.hidden = true
} else {
  resizeFireworkCanvas()
  window.addEventListener('resize', resizeFireworkCanvas, { passive: true })
  window.addEventListener('pointermove', (event) => {
    if (Date.now() - lastBurst < 75) return
    lastBurst = Date.now()
    burst(event.clientX, event.clientY, 6, .75)
  }, { passive: true })
  window.addEventListener('pointerdown', (event) => burst(event.clientX, event.clientY, 25, 1.55), { passive: true })
}

const eventSlider = document.getElementById('eventSlider')
const sliderDots = document.querySelectorAll('.slider-dots span')
let sliderFrame = null
eventSlider.addEventListener('scroll', () => {
  if (sliderFrame !== null) return
  sliderFrame = requestAnimationFrame(() => {
  const cards = [...eventSlider.querySelectorAll('.event-day')]
  const center = eventSlider.scrollLeft + eventSlider.clientWidth / 2
  let active = 0
  let nearest = Infinity
  cards.forEach((card, index) => {
    const cardCenter = card.offsetLeft + card.offsetWidth / 2
    const distance = Math.abs(center - cardCenter)
    if (distance < nearest) { nearest = distance; active = index }
  })
  sliderDots.forEach((dot, index) => dot.classList.toggle('active', index === active))
  sliderFrame = null
  })
}, { passive: true })

const sectionLinks = [...document.querySelectorAll('.floating-nav a')]
let sectionOffsets = []
function refreshSectionOffsets() {
  sectionOffsets = sectionLinks.map((link) => ({ link, top: document.querySelector(link.getAttribute('href'))?.offsetTop || 0 }))
}
function updateSectionNavigation() {
  const marker = window.scrollY + window.innerHeight * .4
  let current = sectionOffsets[0]?.link || sectionLinks[0]
  sectionOffsets.forEach(({ link, top }) => {
    if (top <= marker) current = link
  })
  sectionLinks.forEach((link) => link.classList.toggle('active', link === current))
}
refreshSectionOffsets()
updateSectionNavigation()
let navigationFrame = null
window.addEventListener('scroll', () => {
  if (navigationFrame !== null) return
  navigationFrame = requestAnimationFrame(() => {
    updateSectionNavigation()
    navigationFrame = null
  })
}, { passive: true })
let navigationWidth = window.innerWidth
window.addEventListener('resize', () => {
  if (window.innerWidth === navigationWidth) return
  navigationWidth = window.innerWidth
  refreshSectionOffsets()
}, { passive: true })
