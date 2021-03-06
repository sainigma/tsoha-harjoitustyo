import time
from interfaces.QueryInterface import QueryInterface
from utils.Authentication import Authentication

class User(QueryInterface):
    def initialize(self):
        self.auth = Authentication()

    def userExists(self, username):
        query = 'select id from users where username = "{0}"'.format(str(username))
        result = self.executeQuery(query)
        if (len(result) > 0):
            return True
        return False

    def new(self, username, password):
        if (self.userExists(username)):
            print('user exists')
            return False
        hashedPassword = self.auth.hash(password)
        query = 'insert into users (username, auth) values ("' + username + '", "' + hashedPassword + '");'
        self.executeQuery(query)
        return self.login(username, password)
        
    def login(self, username, password):
        query = 'select auth from users where username = "' + username + '"'
        result = self.executeQuery(query)
        if (len(result) == 0):
            return None
        hashedPassword, salt = result[0][0].split(':')
        testPassword = self.auth.hashWithSalt(password, salt).split(':')[0]
        if (hashedPassword == testPassword):
            token, expires = self.auth.createToken(username)
            tokenQuery = 'insert into verifications (bearer, timeout) values ("' + token + '", ' + str(expires) + ');'
            self.executeQuery(tokenQuery)
            return token
        return None

    def find(self, searchstring, username):
        userID = self._getUserID(username)
        subquery = "select relation from userrelations where user = {0} and type = 1".format(int(userID))
        query = "select id, username from users where id in ({1}) and username like '{0}%'".format(str(searchstring), str(subquery))
        return self.executeQuery(query)

    def relationExists(self, userId, targetId):
        query = 'select id from userrelations where user = {0} and relation = {1}'.format(int(userId), int(targetId))
        result = self.executeQuery(query)
        if (len(result) > 0):
            return True
        return False

    def relate(self, username, target, relationType):
        userID = self._getUserID(username)
        targetID = self._getUserID(target)
        if (userID == None or targetID == None):
            return
        if (self.relationExists(userID, targetID)):
            return
        query = 'insert into userrelations (user, relation, type) values ("' + str(userID) + '", "' + str(targetID) + '", "' + str(relationType) + '")'
        self.executeQuery(query)

    def getFriendRequests(self, username):
        userID = self._getUserID(username)
        subquery = 'select relation from userrelations where user = {0}'.format(int(userID))
        query = 'select username from userrelations left join users u on user = u.id where relation = {0} and user not in ({1})'.format(int(userID), str(subquery))
        return self.executeQuery(query)

    def verify(self, bearer):
        token = bearer[7:]
        query = 'select timeout from verifications where bearer = "' + token + '"'
        result = self.executeQuery(query)
        if (len(result) == 0):
            print('Invalid verification')
            return None
        expires = int(result[0][0])
        if (int(time.time()) > expires):
            print('Verification timeout')
            return None
        username = self.auth.getUsername(token)
        return username

    def belongsToGroup(self, userId, groupId):
        if (int(groupId) == -1):
            return True
        query = 'select accepted, verified from usergroupregister where user = {0} and usergroup = {1}'.format(int(userId), int(groupId))
        result = self.executeQuery(query)
        if (len(result) == 0):
            return False
        print(result[0][0], result[0][1])
        return True

    def _getUserID(self, name):
        query = 'select id from users where username = "{0}"'.format(str(name))
        result = self.executeQuery(query)
        if (len(result) == 0):
            return None
        return result[0][0]