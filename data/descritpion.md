# Data for "Bike Accidents in Brno"


The data are taken from [data brno](https://data.brno.cz/datasets/mestobrno::cyklistick%C3%A9-nehody-bike-accidents/api),
all data are publicly accessible.


## Data Descritpion

See [online docs](https://mmbonline-my.sharepoint.com/:w:/g/personal/kominek_jiri_brno_cz/EW_2EsFBJR5NrvapMV8xf1wBPBKZjM_ofBAcnBxjz712jA?rtime=Uimd6B7M2kg).

* join_count
* target_fid
* id

### Time
* datum (timestamp?) - date of the accident
* den (int, 1-7) - day of the week
* rok (int) - year
* mesic (int) - month
* cas (???)
* hodina (0-24) - hour
* mesic_t (text) - name of the month [CZE]
* den_v_tydnu (text) - name of a day of the week [CZE]

### Location
* nazev (text) - location in Brno, eq _Brno-střed_

#### GPS
* point_x, point_y - geolocation data, degrees, lattitude & longitude
* d, e = (x,y) location in EPSG 5514

### Description
* srazka (text) - description of what collided with the bike [CZE]
* pricina

#### Cyclist
* pohlavi (text, 4: man, woman, boy, girl) - sex
* ozn_osoba (text) - more about cyclist (has helmet or not)
* osoba (text) - where driver or not (probably not used)


* alkohol (text, few options) - whether or not (and how much) alcohol was used [CZE]
* zavineni
* nasledky
* stav_vozovky
* povetrnostni_podm
* viditelnost
* rozhled
* misto_nehody
* druh_komun
* druh_vozidla
* stav_ridic
* ovlivneni_ridice
* vek_skupina

### Result
* nasledek (text, 4 option) - the result of the accident [CZE] (*24 hours after accident)
* hmotna_skoda (int) - x100 Kc, material damage

#### Injuries
* usmrceno_os (int) - how many were killed
* tezce_zran_os (int) - how many people were seriously injured
* lehce_zran_os (int) - how many only mildly injured

