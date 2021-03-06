export default class Friends{
    constructor() {
        window.friends = this
        this.empty = true
    }

    requestSent(success) {
        if (success) {
            utils.setInnerHTML('friendrequeststatus', 'Friend request sent')
        }
    }

    friendRequest(form, next) {
        services.sendForm(form, "/api/user/friend/request", next)
    }

    spawnCategory(label) {
        const titleDiv = document.createElement('div')
        titleDiv.className = 'grid-title-big'
        titleDiv.innerHTML = label

        const categoryContainer = document.createElement('div')
        categoryContainer.className = 'scrollingfield grid-wide'
        categoryContainer.style.width = '100%'
        
        return {titleDiv, categoryContainer}
    }

    async myFriends(div) {
        const res = await window.services.get('/api/user/find/?search=*')
    
        const {titleDiv, categoryContainer} = this.spawnCategory('My friends')
        
        const b = document.createElement('button')
        b.className = "button-wide"
        b.innerHTML = "add friend"
        b.style = 'grid-column-start:1; grid-column-end: 4'
        b.onclick = async () => {
            setBlocker(true)
            utils.setValue('friendrequestinput', '')
            utils.setInnerHTML('friendrequeststatus', '')
            toggleSite('addFriend')
        }
    
        if (res.target.status == 200) {
            const friendsList = JSON.parse(res.target.response)
            console.log(friendsList)
            
            if (friendsList.length == 0) {
                categoryContainer.innerHTML = 'no friends'
                return
            }
            
            const span = document.createElement('span')
            friendsList.forEach(friend => {
                span.innerHTML += `${friend.name}, `
            })
            span.innerHTML = span.innerHTML.slice(0, span.innerHTML.length - 2)
            categoryContainer.appendChild(span)
        }

        div.appendChild(titleDiv)
        div.appendChild(categoryContainer)
        div.appendChild(b)
    }

    async friendRequests(div) {        
        const {titleDiv, categoryContainer} = this.spawnCategory('Friend requests')

        const res = await window.services.get('/api/user/friend/request')
        if (res.target.status == 204) {
            return
        }
        const requests = JSON.parse(res.target.response)
        
        div.appendChild(titleDiv)
        div.appendChild(categoryContainer)

        requests.forEach(friend => {
            const d = document.createElement('div')
            d.className = 'grid-title grid-request'
            d.innerHTML = friend

            const acceptButton = document.createElement('button')
            const ignoreButton = document.createElement('button')
            acceptButton.innerHTML = 'Accept'
            ignoreButton.innerHTML = 'Ignore'
            
            acceptButton.className = 'button-accept grid-title-button'
            ignoreButton.className = 'button-refuse grid-title-button'
            
            acceptButton.onclick = () => {
                const form = new FormData()
                form.append('friend', friend)
                this.friendRequest(form, ()=>{
                    friends.rerender()
                })
            }

            acceptButton.style.right = '8em'
            ignoreButton.style.right = '0'
            d.appendChild(acceptButton)
            d.appendChild(ignoreButton)

            categoryContainer.appendChild(d)
        })
    }

    async groupRequests(div) {
        const {titleDiv, categoryContainer} = this.spawnCategory('Group requests')
        div.appendChild(titleDiv)
        div.appendChild(categoryContainer)
    }

    async clear() {
        const removeChild = async(div) => {
            await div.removeChild(div.firstChild)
            return !div.hasChildNodes()
        }
        const div = document.getElementById("friendslist")
        while(div.hasChildNodes()) {
            this.empty = await removeChild(div)
        }
    }

    async rerender() {
        await this.clear()
        this.listFriends()
    }

    async listFriends(forcedUpdate) {
        if (!this.empty) {
            return
        }
        const div = document.getElementById("friendslist")
    
        if (forcedUpdate) {
            await utils.setInnerHTML('friendslist', '')
        } else if (div.children.length != 0) {
            return
        }
        await this.myFriends(div)
        await this.friendRequests(div)
        await this.groupRequests(div)
        this.empty = false
    }
}