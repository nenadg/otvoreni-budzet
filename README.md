[![Build Status](https://travis-ci.org/nenadg/otvoreni-budzet.png?branch=master)](https://travis-ci.org/nenadg/otvoreni-budzet)

Otvoreni budzet
=============================

## Uvod
Do sada su budžetski podaci (bar kod nas u Republici Srpskoj a i Bosni i Hercegovini) dolazili striktno u read-only modu kroz PDF format koji se može preuzeti sa sajta [Vlade RS](http://www.vladars.net/sr-SP-Cyrl/Vlada/Aktivnosti/Budzet/Pages/Arhiva.aspx) ili [Narodne skupštine RS](http://www.vladars.net/sr-SP-Cyrl/Vlada/Aktivnosti/Budzet/Pages/Arhiva.aspx), ili pregledati u Službenom glasniku. 

Ovako su trenutne vlasti ispunjavale svoju zakonsku obavezu prema glasačima i poreskim obveznicima, obavještujući ih na štur i glup način o putevima potrošnje njihovog (vašeg) novca. Naravno da te dokumente rijetko ko čita jer su crno-bijeli, glomazni, puni brojeva i generalno neinteresantni. Kroz tu sliku većina istih tih poreskih obveznika (glasača) i gleda na državni budžet : državne pare koje sa njim nemaju nikakve veze. To naravno nije istina. 

Budžet su pare svih nas i svi u njega uplaćujemo direktno, indirektno (17% cijene koštanja, npr. prve jutarnje kafe), kroz prekršajne kazne itd.

Budžetski podaci su javni podaci i kao takvi podložni kritici javnosti. 

Nije mi bilo teško da ih prepišem u neki drugi oblik, bliži programeru i/ili analitičaru, nekome ko bi mogao od njih da ima nekakvu konkretnu korist (npr. da vidi koliko se para više trošilo tokom izbornih godina u odnosu na druge...).

A za opštenarodnu korist sam te podatke posredstvom [D3.JS](http://d3js.org/) biblioteke uobličio u niz krajnje linearnih grafika sa osnovnim prikazima potrošnje i prihoda. Ovaj dio se nalazi na sajtu [budzet.aws.af.cm](http://budzet.aws.af.cm/).

Ovaj projekt je moja kritika načina dostavljanja i prikaza budžetskih podataka u današnje vrijeme koje dopušta malo širi pristup. Nastao je za 0 konvertibilnih maraka iz čistog hira i viška slobodnog vremena.

### Tehničke pojedinosti
Projekat se oslanja na servis (koji ću kasnije isto dići na github) za parsiranje PDF dokumenata budžeta (ovih sa sajta Vlade i Narodne skupštine), te bazu analitičkog kontnog plana koji se može naći na istim sajtovima. Pisan je u JavaScript-u ( [Node.js](http://nodejs.org/) ) a za čuvanje podataka koristi [MongoDB](http://www.mongodb.org/).

*Napomena: Neke stvari nisu sjajno riješene tako da će vjerovatno biti ažuriranja koja će možda izbaciti čitave cjeline, ali šta bih sad.


### Preduslovi
Instaliran Node.js, redis i mongodb baze podataka (redis je neophodan samo u Front-end-u projekta ukoliko se ovaj izvršava na nekom od Cloud provajdera npr. Nodejitsu, Appfog...).

Modul za autentikaciju koristi [bcrypt](http://en.wikipedia.org/wiki/Bcrypt) za koji je potrebno da imate prethodno instaliran paket :

- libssl-dev

#### Instalacija libssl-dev paketa:

Ubuntu
$ sudo apt-get install libssl-dev

OpenSUSE
$ sudo zypper in libopenssl-devel

Nemam pojma kako ide na Windows-u.

### Instacija
Nakon preuzimanja izvornog koda (source-a), potrebno je pokrenuti:
    $ npm install
    
### Pokretanje
    $ node app

Ova verzija će raditi na lokalnom računaru na portu 3000 tj. - http://localhost:3000

## Licenciranje

MIT
