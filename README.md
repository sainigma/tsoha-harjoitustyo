# tsoha-harjoitustyo

## Sisällysluettelo

- [Sisällysluettelo](#sisällysluettelo)
    - [Kuvaus](#kuvaus)
    - [Perustoiminnallisuudet](#perustoiminnallisuudet)
    - [Taulut](#taulut)
    - [Jatkokehitys](#jatkokehitys)

## Kuvaus

Websovellus peli-iltojen suunnitteluun. Sovelluksella voi sopia ryhmien kesken peliaikoja ja valita pelattavia pelejä.

## Perustoiminnallisuudet

- Tapahtumat ovat aktiivisia rajallisen aikaa
- Tapahtumalla on useita näkyvyysasetuksia (kaverit, kaverien kaverit, julkinen)
- Tapahtumaan voi liittyä viestiketju
    - Viestien replyhaarautuminen
- Tapahtumia voi suunnitella joko peli- tai käyttäjävetoisesti
    - Pelivetoisessa tapahtumasuunnittelussa tapahtuman luoja ohittaa pelistä äänestyksen, ja kutsun tapahtumaan voi lähettää vain käyttäjille jotka eivät ole opt-outanneet kyseisen pelin pelaamisesta
    - Käyttäjävetoisessa tapahtumasuunnittelussa tapahtumaan voi valita pelin vain peleistä joista tapahtumaan kutsutut käyttäjät eivät ole opt-outanneet
        - Opt-outin määritelmän voi valita tapahtumaa luodessa
            - Opt-out = halukkuus pelata peliä tiettyä raja-arvoa pienempi tai korkeampi. Jälkimmäisessä tapauksessa tapahtumasta suljetaan peliä fanittavat pois ja tapahtumaan kutsutaan vain pelaajat jotka eivät absoluuttisesti halua pelata peliä (esim. case mario party tai monopoli)
- Normaali kulku tapahtumalle:
    - Tapahtuman luonti
    - (jos pelivetoinen suunnittelu) Pelin valinta
    - Käyttäjien kutsuminen
    - (jos käyttäjävetoinen suunnittelu) Pelattavasta pelistä äänestys
    - Peliajasta äänestys
    - Tapahtuman epäaktivoituminen ja arkistointi (joko manuaalisesti tai ajan perusteella)

## Taulut

- Käyttäjät
    - id
    - nimimerkki
    - salasanahash

- Keksit
    - Käyttäjän id
    - verifikaatiotunnus
    - timeout

- Käyttäjärelaatiot
    - käyttäjän id
    - kohteen id
    - relaatiotyyppi

Tyypit, 1 = kaveri, 0 = blokattu. Kaveruus vaatii kummaltakin käyttäjältä saman relaatiotyypin, blokkaukseen riittää merkintä vain toiselta. Kaveruuden poisto ei merkitse relaatiota nollaksi, vaan poistaa tietueen.

- Halukkuus pelata peliä -taulu
    - käyttäjän id
    - pelin id
    - liukuasteikko pelin pelaamishalukkuudelle, 0-10

Opt-out mekanismin kannalta oletan että pelin pelaamishalukkuudella ja taitotasolla pelissä on suora korrelaatio. Muutoin taitotason voisi ottaa erilliseksi lisäkentäksi.

- Viestit
    - id
    - juuri id (esim ryhmä, tapahtuma, käyttäjä tai toinen viesti)
    - lähettäjän id
    - sisältö
    - timestamp

- Pelit
    - id
    - nimi
    - GiantBomb id
    - cachetettu sisältö

Pelaajien maksimimäärä olisi nice-to-have ominaisuus pelien filtteröintiin, tätä tietoa ei vaan saa suoraan ulos giantbombin apista/määritelmä hämärtyy entisestään kun ottaa huomioon että peleissä pelaajamäärät vaihtelee pelimuodon mukaan

- Tapahtumat
    - id
    - luojan id
    - ryhmän id
    - nimi
    - kuvaus
    - luontiaika
    - aktiivisuusaika
    - opt-out alempi raja-arvo
    - opt-out ylempi raja-arvo

- Kutsut
    - tapahtuman id
    - käyttäjän id

Jos käyttäjä peruu/hyväksyy kutsun tapahtumaan, kutsu poistetaan taulusta. Hyväksymisen tapauksessa Liittymiset - tauluun lisätään merkintä.

- Liittymiset
    - käyttäjän id
    - tapahtuman id

- Peliäänestykset
    - äänestäjän id
    - tapahtuman id
    - pelin id
    - äänestys, liukuluku 0-10

Äänestyksiä voi tehdä yhteen tapahtumaan rajattomasti, kuitenkin siten että yhdestä pelistä on kultakin käyttäjältä vain yksi ääni

- Päivämäärä-äänestykset
    - äänestäjän id
    - tapahtuman id
    - päivämäärä
    - kellonaika (tunnin tarkkuudella)

- Ryhmät
    - id
    - nimi

- Ryhmäjäsenyydet
    - käyttäjän id
    - kutsujan id
    - ryhmän id
    - käyttäjäryhmä
    - kuitattu

Jäsenyys vaatii kutsujan ja kuittauksen. Jos käyttäjä hakee ryhmän jäsenyyttä, jäsenyys vaatii "kutsun" moderaattorilta tai adminilta. Jos käyttäjä kutsutaan ryhmään, jäsenyys vaatii kuittauksen käyttäjältä. Käyttäjäryhmät 0 = jäsen, 1 = moderaattori, 2 = admin

- Discordkäyttäjät
    - discord id
    - käyttäjä id
    - discord tili tunnistettu

- Discordkanavat
    - ryhmän id
    - kanavan nimi
    - tapahtuman id

## Jatkokehitys

Web-käyttöliittymän tueksi discord-botti, jolla voi päivittää kanaville/käyttäjille tapahtumasuunnittelun ja äänestyksien etenemistä.