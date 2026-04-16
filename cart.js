const events = [
    {
        id: "EVT001",
        name: "Overwatch Tournament",
        description: "Competitive event",
        price: 30,
        category: "Tournament",
        unit: "entry"
    },
    {
        id: "EVT002",
        name: "League of Legends Workshop",
        description: "Learn the basics of League of Legends",
        price: 20,
        category: "Workshop",
        unit: "entry"
    },
    {
        id: "EVT003",
        name: "Valorant Practice",
        description: "Practice sessions",
        price: 0,
        category: "Practice",
        unit: "session"
    }
]

const cartStorageKey = 'studentClubCart'
let cart = []

function loadCart() {
    const savedCart = localStorage.getItem(cartStorageKey)
    cart = savedCart ? JSON.parse(savedCart) : []
    updateCartDisplay()
}

function saveCart() {
    localStorage.setItem(cartStorageKey, JSON.stringify(cart))
}

function displayEvents(eventsToShow) {
    const eventList = $('#eventList')
    eventList.empty()

    if (!eventsToShow.length) {
        eventList.html(`
            <div class="col-12">
                <div class="alert alert-info">No events match your search.</div>
            </div>
        `)
        return
    }

    eventsToShow.forEach(event => {
        const eventCard = `
            <div class="col-sm-12 col-md-6 col-lg-4 mb-4">
                <div class="card h-100">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${event.name}</h5>
                        <p class="card-text">${event.description}</p>
                        <p class="card-text"><strong>Price:</strong> $${event.price} per ${event.unit}</p>
                        <button class="btn btn-primary mt-auto add-to-cart" data-id="${event.id}">Add to Cart</button>
                    </div>
                </div>
            </div>
        `
        eventList.append(eventCard)
    })
}

function addToCart(eventItem) {
    const existingItem = cart.find(item => item.id === eventItem.id)
    if (existingItem) {
        existingItem.quantity += 1
    } else {
        cart.push({ ...eventItem, quantity: 1 })
    }
    saveCart()
    updateCartDisplay()
}

$(document).ready(function() {
    displayEvents(events)
    loadCart()

    $(document).on('click', '.add-to-cart', function() {
        const eventId = $(this).data('id')
        const eventItem = events.find(e => e.id === eventId)
        if (eventItem) {
            addToCart(eventItem)
        }
    })

    $('#searchInput').on('keyup', function() {
        const value = $(this).val().toLowerCase()
        const filteredEvents = events.filter(event => event.name.toLowerCase().includes(value))
        displayEvents(filteredEvents)
    })
});

function updateCartDisplay() {
    const cartItems = $('#cartItems')
    cartItems.empty()
    let total = 0

    if (!cart.length) {
        cartItems.html('<p class="text-muted">Your cart is empty</p>')
    } else {
        const listGroup = $('<ul class="list-group mb-3"></ul>')
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity
            total += itemTotal
            const cartItem = `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    ${item.name} (x${item.quantity})
                    <span>$${itemTotal.toFixed(2)}</span>
                </li>
            `
            listGroup.append(cartItem)
        })
        cartItems.append(listGroup)
    }

    $('#cartTotal').text(`$${total.toFixed(2)}`)
}