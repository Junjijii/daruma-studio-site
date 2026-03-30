import './style.css'

const sectionContent = [
  {
    id: 'hero',
    title: 'Daruma Studio',
    body: 'Text-first motion studies for a studio site inspired by editorial systems.',
  },
  {
    id: 'philosophy',
    title: 'Philosophy',
    body: 'Dynamic typography, deliberate spacing, and layout logic driven by code.',
  },
  {
    id: 'works',
    title: 'Works',
    body: 'Case studies will expand here as masonry and flow-based layouts come online.',
  },
  {
    id: 'services',
    title: 'Services',
    body: 'Accordion-driven service outlines will use lightweight spring motion.',
  },
  {
    id: 'contact',
    title: 'Contact',
    body: 'A minimal call to action will close the single-page experience.',
  },
]

for (const section of sectionContent) {
  const element = document.getElementById(section.id)

  if (!element) {
    continue
  }

  element.innerHTML = `
    <p class="section-label">${element.dataset.label ?? ''}</p>
    <h1 class="section-title">${section.title}</h1>
    <p class="section-body">${section.body}</p>
  `
}
