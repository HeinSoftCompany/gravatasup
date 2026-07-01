import './style.css'

const whatsappNumber = '5581989282659'
const STORAGE_KEY = 'gravata-suplementos-cart'

const productsData = [
  {
    id: 'CRE-001',
    name: 'Creatina Creafort',
    unit: '300g',
    price: 145.00,
    category: ['creatina'],
    search: 'creatina creafort creatina 300g suplemento força performance massa muscular',
    img: '/assets/products/creatina-creafort.svg',
    badge: 'Creatina',
  },
  {
    id: 'SUP-001',
    name: 'Suplemento Visafort',
    unit: 'Unidade',
    price: 280.00,
    category: ['suplementos'],
    search: 'suplemento visafort vitaminas saúde energia disposição suplemento',
    img: '/assets/products/suplemento-visafort.svg',
    badge: 'Suplemento',
  },
  {
    id: 'WHY-001',
    name: 'Whey Protein Absolut',
    unit: '900g',
    price: 89.90,
    category: ['whey'],
    search: 'whey protein absolut proteína 900g suplemento massa muscular academia',
    img: '/assets/products/whey-protein-absolut.svg',
    badge: 'Whey Protein',
  },
  {
    id: 'WHY-002',
    name: 'Whey Protein DUX',
    unit: '900g',
    price: 185.00,
    category: ['whey'],
    search: 'whey protein dux proteína 900g suplemento massa muscular academia',
    img: '/assets/products/whey-protein-dux.svg',
    badge: 'Whey Protein',
  },
]

const homeScreen = document.getElementById('homeScreen')
const ordersScreen = document.getElementById('ordersScreen')
const homeNav = document.getElementById('homeNav')
const ordersNav = document.getElementById('ordersNav')
const backHome = document.getElementById('backHome')
const searchInput = document.getElementById('searchInput')
const productsGrid = document.getElementById('productsGrid')
const noResult = document.getElementById('noResult')
const categoryTabs = document.querySelectorAll('#categoryTabs button')
const cartCount = document.getElementById('cartCount')
const cartContent = document.getElementById('cartContent')
const summaryItems = document.getElementById('summaryItems')
const summaryTotal = document.getElementById('summaryTotal')
const clientName = document.getElementById('clientName')
const clientPlace = document.getElementById('clientPlace')
const clientCity = document.getElementById('clientCity')
const clientNote = document.getElementById('clientNote')
const sendWhatsapp = document.getElementById('sendWhatsapp')
const openSheet = document.getElementById('openSheet')
const openSheetOrders = document.getElementById('openSheetOrders')
const bottomSheet = document.getElementById('bottomSheet')
const overlay = document.getElementById('overlay')

let cart = loadCart()
let activeCategory = 'todos'
let currentSlide = 0

function formatMoney(value) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch {
    return []
  }
}

function saveCart() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
}

function renderProducts() {
  productsGrid.innerHTML = productsData
    .map(
      (product) => `
        <article
          class="product-card"
          data-id="${product.id}"
          data-name="${product.name}"
          data-category="${product.category.join(' ')}"
          data-search="${product.search}"
        >
          <span class="product-badge">${product.badge}</span>
          <img src="${product.img}" alt="${product.name}" loading="lazy" />
          <h3>${product.name}</h3>
          <small>${product.unit}</small>
          <strong>${formatMoney(product.price)}</strong>
          <button class="add-btn" type="button" data-id="${product.id}" aria-label="Adicionar ${product.name}">+</button>
        </article>
      `,
    )
    .join('')
}

function showScreen(screen) {
  if (screen === 'home') {
    homeScreen.classList.add('active')
    ordersScreen.classList.remove('active')
    homeNav.classList.add('active')
    ordersNav.classList.remove('active')
  }

  if (screen === 'orders') {
    ordersScreen.classList.add('active')
    homeScreen.classList.remove('active')
    ordersNav.classList.add('active')
    homeNav.classList.remove('active')
    renderCart()
  }

  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function setActiveCategory(category) {
  activeCategory = category

  categoryTabs.forEach((button) => {
    button.classList.toggle('active', button.dataset.category === category)
  })

  filterProducts()
}

function filterProducts() {
  const searchValue = searchInput.value.toLowerCase().trim()
  const products = document.querySelectorAll('.product-card')
  let visibleProducts = 0

  products.forEach((product) => {
    const productSearch = product.dataset.search.toLowerCase()
    const productName = product.dataset.name.toLowerCase()
    const productCategory = product.dataset.category.toLowerCase()

    const matchesSearch =
      productSearch.includes(searchValue) || productName.includes(searchValue)

    const matchesCategory =
      activeCategory === 'todos' || productCategory.includes(activeCategory)

    if (matchesSearch && matchesCategory) {
      product.classList.remove('hide')
      visibleProducts++
    } else {
      product.classList.add('hide')
    }
  })

  noResult.style.display = visibleProducts === 0 ? 'block' : 'none'
}

function addToCart(productId) {
  const product = productsData.find((item) => item.id === productId)
  if (!product) return

  const existingProduct = cart.find((item) => item.id === product.id)

  if (existingProduct) {
    existingProduct.quantity++
  } else {
    cart.push({ ...product, quantity: 1 })
  }

  saveCart()
  updateCartCount()
  renderCart()
}

function updateCartCount() {
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0)

  cartCount.textContent = totalItems
  cartCount.classList.toggle('active', totalItems > 0)
}

function renderCart() {
  if (cart.length === 0) {
    cartContent.innerHTML = `
      <div class="empty-cart">
        <h3>Seu pedido está vazio</h3>
        <p>Volte para o início e adicione produtos ao pedido.</p>
      </div>
    `

    summaryItems.textContent = '0'
    summaryTotal.textContent = formatMoney(0)
    return
  }

  cartContent.innerHTML = cart
    .map(
      (item) => `
        <article class="cart-item">
          <img src="${item.img}" alt="${item.name}" />
          <div class="cart-info">
            <h3>${item.name}</h3>
            <small>${item.unit}</small>
            <strong>${formatMoney(item.price)}</strong>

            <div class="qty">
              <button class="minus" type="button" data-action="decrease" data-id="${item.id}" aria-label="Diminuir ${item.name}">−</button>
              <span>${item.quantity}</span>
              <button class="plus" type="button" data-action="increase" data-id="${item.id}" aria-label="Aumentar ${item.name}">+</button>
            </div>
          </div>

          <button class="remove" type="button" data-action="remove" data-id="${item.id}" aria-label="Remover ${item.name}">×</button>
        </article>
      `,
    )
    .join('')

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0)
  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0)

  summaryItems.textContent = totalItems
  summaryTotal.textContent = formatMoney(totalPrice)
}

function increaseQuantity(id) {
  const product = cart.find((item) => item.id === id)
  if (!product) return

  product.quantity++

  saveCart()
  updateCartCount()
  renderCart()
}

function decreaseQuantity(id) {
  const product = cart.find((item) => item.id === id)
  if (!product) return

  if (product.quantity > 1) {
    product.quantity--
  } else {
    cart = cart.filter((item) => item.id !== id)
  }

  saveCart()
  updateCartCount()
  renderCart()
}

function removeItem(id) {
  cart = cart.filter((item) => item.id !== id)

  saveCart()
  updateCartCount()
  renderCart()
}

function sendOrderToWhatsapp() {
  if (cart.length === 0) {
    alert('Adicione pelo menos um produto ao pedido.')
    return
  }

  if (!clientName.value.trim()) {
    alert('Digite o nome do responsável.')
    return
  }

  if (!clientPlace.value.trim()) {
    alert('Informe a retirada ou o local de entrega.')
    return
  }

  if (!clientCity.value) {
    alert('Selecione a cidade ou região.')
    return
  }

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0)

  const productsText = cart
    .map((item) => {
      return [
        `ID: ${item.id}`,
        `Produto: ${item.name}`,
        `Quantidade: ${item.quantity}x ${item.unit}`,
        `Valor unitário: ${formatMoney(item.price)}`,
        `Subtotal: ${formatMoney(item.price * item.quantity)}`,
      ].join('\n')
    })
    .join('\n\n')

  const message = `🔥 *Novo pedido pelo site - Gravatá Suplementos*

*Dados do cliente*
Nome: ${clientName.value.trim()}
Retirada/Entrega: ${clientPlace.value.trim()}
Cidade/Região: ${clientCity.value}
Observação: ${clientNote.value.trim() || 'Nenhuma'}

*Produtos do pedido*
${productsText}

*Total:* ${formatMoney(totalPrice)}`

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
  window.open(whatsappUrl, '_blank')
}

function openBottomSheet() {
  bottomSheet.classList.add('active')
  overlay.classList.add('active')
}

function closeBottomSheet() {
  bottomSheet.classList.remove('active')
  overlay.classList.remove('active')
}

function scrollToProducts() {
  showScreen('home')
  closeBottomSheet()

  setTimeout(() => {
    productsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, 250)
}

function showOffers() {
  showScreen('home')
  closeBottomSheet()
  setActiveCategory('ofertas')

  setTimeout(() => {
    productsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, 250)
}

function handleQuickAction(action) {
  if (action === 'scroll-products') {
    scrollToProducts()
  }

  if (action === 'show-offers') {
    showOffers()
  }

  if (action === 'go-orders') {
    closeBottomSheet()
    showScreen('orders')
  }

  if (action === 'close-sheet') {
    closeBottomSheet()
  }
}

function startHeroSlider() {
  const heroSlides = document.querySelectorAll('.hero-slide')
  const dots = document.querySelectorAll('.dot')

  if (heroSlides.length === 0) return

  setInterval(() => {
    heroSlides[currentSlide]?.classList.remove('active')
    dots[currentSlide]?.classList.remove('active')

    currentSlide = currentSlide + 1 >= heroSlides.length ? 0 : currentSlide + 1

    heroSlides[currentSlide]?.classList.add('active')
    dots[currentSlide]?.classList.add('active')
  }, 3500)
}

homeNav.addEventListener('click', () => showScreen('home'))
ordersNav.addEventListener('click', () => showScreen('orders'))
backHome.addEventListener('click', () => showScreen('home'))
searchInput.addEventListener('input', filterProducts)
sendWhatsapp.addEventListener('click', sendOrderToWhatsapp)
openSheet.addEventListener('click', openBottomSheet)
openSheetOrders.addEventListener('click', openBottomSheet)
overlay.addEventListener('click', closeBottomSheet)

categoryTabs.forEach((tab) => {
  tab.addEventListener('click', () => setActiveCategory(tab.dataset.category))
})

productsGrid.addEventListener('click', (event) => {
  const button = event.target.closest('.add-btn')
  if (!button) return

  addToCart(button.dataset.id)
})

cartContent.addEventListener('click', (event) => {
  const button = event.target.closest('button')
  if (!button) return

  const action = button.dataset.action
  const id = button.dataset.id

  if (action === 'increase') increaseQuantity(id)
  if (action === 'decrease') decreaseQuantity(id)
  if (action === 'remove') removeItem(id)
})

document.addEventListener('click', (event) => {
  const actionButton = event.target.closest('[data-action]')
  if (!actionButton) return

  handleQuickAction(actionButton.dataset.action)
})

renderProducts()
filterProducts()
updateCartCount()
renderCart()
startHeroSlider()