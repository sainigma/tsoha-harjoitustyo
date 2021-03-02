import {listResults} from '/scripts/static/listResults.js'

export default class EventEditor{
    constructor() {
        window.eventeditor = this
        this.div = null
        this.eventId = -1
    }

    async setInnerHTML(target, content) {
        const element = await document.getElementById(target)
        element.innerHTML = content
        return element
    }

    async setVisibility(target, tag) {
        const element = await document.getElementById(target)
        element.style.display = tag
        return element
    }

    collapseHours(hours) {
        let arr1 = []
        let arr2 = []

        let i = 0
        let previous = 0
        arr1.push(hours[0])
        previous = arr1[0]
        hours.forEach(hour => {
            if (hour > previous + 1) {
                arr1.push(hour)
                arr2.push(previous)
            }
            previous = hour
            i++
        })
        arr2.push(previous)

        let result = ''
        for(let j = 0; j < arr1.length; j++) {
            if (arr1[j] == arr2[j]) {
                result += arr1[j]
            } else {
                result += `${arr1[j]} - ${arr2[j]}`
            }
            if (j + 1 < arr1.length) {
                result += ', '
            }
        }
        return result
    }

    async activateDateAdder() {
        const dateaddertable = document.getElementById('dateadderdates')
        dateaddertable.innerHTML = ''
        const result = await window.services.get(`/api/vote/date/${this.eventId}`)
        if (result.target.status != 200) {
            return
        }

        if (result.target.response != "[]") {
            const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            const dates = JSON.parse(result.target.response)
            dates.forEach(date => {
                const collapsedHours = this.collapseHours(date.hours)
                const dateObj = new Date(Date.parse(date.date))
                
                const tr = document.createElement('tr')
                const datefield = document.createElement('td')
                const buttonfield = document.createElement('td')
                const removebuttonField = document.createElement('td')
                const copybutton = document.createElement('button')
                const removebutton = document.createElement('button')

                datefield.innerHTML = `${weekdays[dateObj.getDay()]} ${dateObj.getDate()}/${months[dateObj.getMonth()]} ${dateObj.getFullYear()}: ${collapsedHours}`                
                
                copybutton.innerHTML = 'copy to editor'
                copybutton.onclick = () => {
                    eventeditor.dateCopy(date.date, date.hours)
                }
                removebutton.innerHTML = 'remove'

                buttonfield.appendChild(copybutton)
                removebuttonField.appendChild(removebutton)
                tr.appendChild(datefield)
                tr.appendChild(buttonfield)
                tr.appendChild(removebuttonField)
                dateaddertable.appendChild(tr)
            })
        }
        this.setVisibility('dateadder', 'block')
        this.setVisibility('eventeditorblocker', 'block')
    }

    resetDateAdder() {
        const dateitem = document.getElementById('dateadderdate')
        dateitem.value = ""
        this.dateSetRange(0, 23, false)
        this.setVisibility('eventeditorcontrols', 'block')
    }

    dateCopy(date, hours) {
        const dateitem = document.getElementById('dateadderdate')
        dateitem.value = date
        console.log(dateitem)
        hours.forEach(hour => {
            const item = document.getElementById(`dateaddervalues${hour}`)
            item.checked = true
        })
        this.setVisibility('eventeditorcontrols', 'none')
        this.setVisibility('eventeditordateadderform', 'block')
    }

    dateSetRange(start, end, value) {
        for(let i = start; i <= end; i++) {
            const item = document.getElementById(`dateaddervalues${i}`)
            item.checked = value
        }
    }

    dateToggleRange(start, end) {
        for(let i = start; i <= end; i++) {
            const item = document.getElementById(`dateaddervalues${i}`)
            item.checked = !item.checked
        }
    }

    clearComments() {
        const commentParent = document.getElementById('eventeditorcomments')
        commentParent.innerHTML = ''
    }

    async updateComments() {
        const currentUser = window.login.getUser()
        
        const addComment = (comment) => {
            const commentElement = document.createElement('p')
            const commentDate = new Date(comment.time * 1000)
            const timestamp = `${('0'+commentDate.getHours()).slice(-2)}:${('0'+commentDate.getMinutes()).slice(-2)}:${('0'+commentDate.getSeconds()).slice(-2)}`
            
            let usertag = comment.name
            usertag = comment.name === currentUser ? `<b>${usertag}</b>` : usertag
            commentElement.innerHTML = `[${timestamp}] &#60;${usertag}&#62;: ${comment.content}`
            commentElement.className = 'comment'
            commentParent.appendChild(commentElement)
        }

        const target = `/api/comment/${this.eventId}`
        const commentParent = document.getElementById('eventeditorcomments')
        
        const result = await window.services.get(target)
        if (result.target.status !== 200) {
            return
        }
        const comments = JSON.parse(result.target.response)
        if (comments.length == 0) {
            commentParent.innerHTML = ''
            return
        }
        for (let i = commentParent.childElementCount; i < comments.length; i++) {
            const comment = comments[i]
            addComment(comment)
        }
        commentParent.scrollTop = commentParent.scrollHeight
    }

    async sendForm(event, next) {
        const data = new FormData(event.form)
        data.append('eventId', this.eventId)
        const formJSON = Object.fromEntries(data.entries())
        const result = await window.services.post(`/api/vote/date/`, formJSON)
        if (result.target.status == 200) {
            next()
        }
    }

    async comment() {
        const commentfield = await document.getElementById('commentfield')
        const target = '/api/comment/new'
        const params = {
            eventId:this.eventId,
            targetId:-1,
            content:commentfield.value
        }
        commentfield.disabled = true
        console.log(params)
        const result = await window.services.post(target, params)
        if (result.target.status == 200) {
            commentfield.value = ''
            this.updateComments()
        }
        commentfield.disabled = false
    }

    close() {
        this.setVisibility('dateadder', 'none')
        this.setVisibility('eventeditordateadderform', 'none')
        this.resetDateAdder()
        window.toggleSite('eventeditor')
        window.setBlocker(false)
    }

    setSearch(e) {
        this.usertofind = e
    }

    async inviteUser(username) {
        const target = '/api/user/invite/'
        const params = {'targetuser':username, 'eventid': this.eventId}
        const result = await window.services.post(target, params)
    }

    async searchUser(e) {
        const wrapper = (params) => {
            this.inviteUser(params.name)
        }
        e.disabled = true
        e.value = ''
        const result = await window.services.get('/api/user/find/?search='+this.usertofind)
        e.disabled = false
        listResults(result.target.response, 'eventeditorinvitelist', 'Invite', wrapper)
    }

    async update() {
        this.div = await this.setVisibility('eventeditor', 'none')
        
        const previousEventId = this.eventid
        this.eventId = window.state.get('eventid')
        if (previousEventId != this.eventid) {
            this.clearComments()
        }
        const res = await window.services.get('/api/event/' + this.eventId)
        if (res.target.status !== 200) {
            return
        }
        window.setBlocker(true)

        this.updateComments()
        const responseBody = JSON.parse(res.target.response)
        const info = responseBody.info
        const eventInfo = {
            title:info[0],
            description:info[1],
            usergroup:info[2],
            gameId:info[3],
            created:info[4],
            timeout:info[5],
            optupper:info[6],
            optlower:info[7]
        }
        this.setInnerHTML('eventeditortitle', eventInfo.title)
        this.setInnerHTML('eventdescription', eventInfo.description)
        this.setInnerHTML('eventdescriptioneditor', eventInfo.description)

        this.setInnerHTML('eventparticipants', responseBody.participants.join(', '))

        if (responseBody.owner === window.login.getUser()) {
            this.setVisibility('eventeditoradminpanel', 'grid')
        } else {
            this.setVisibility('eventeditoradminpanel', 'none')
        }
        this.setVisibility('eventeditorgamelabel', 'none')
        this.setVisibility('eventeditorgameitem', 'none')
        this.setVisibility('eventeditor', 'block')
        if (eventInfo.gameId != -1) {
            this.setVisibility('eventeditorgamelabel', 'inherit')
            this.setVisibility('eventeditorgameitem', 'inherit')
            this.setInnerHTML('eventeditorgameitem', '<i>fetching..</i>')
            const gameRes = await window.services.get('/api/game/' + eventInfo.gameId)
            if (gameRes.target.status == 200) {
                const gameInfo = JSON.parse(gameRes.target.response)
                this.setInnerHTML('eventeditorgameitem', `<a target='_blank' href='https://www.igdb.com/games/${gameInfo.slug}/'>${gameInfo.name}</a>`)
            } else {
                this.setVisibility('eventeditorgamelabel', 'none')
                this.setVisibility('eventeditorgameitem', 'none')        
            }
        }
    }
}