from flask import Flask, request, jsonify,abort, session, send_from_directory
from werkzeug.security import check_password_hash, generate_password_hash
from mysql.connector import connect, Error
from flask_cors import CORS
from datetime import timedelta
from flask import send_from_directory
from werkzeug.utils import secure_filename
import mysql.connector
import logging
import os
from flask_login import LoginManager, login_user, logout_user, current_user, login_required,UserMixin
from datetime import datetime
import stripe
import json
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_login import current_user, login_required
from datetime import datetime, timezone, timedelta
import pytz
from zoneinfo import ZoneInfo
from flask import session
import jwt
from functools import wraps
import pytz
from flask import current_app as app
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from flask import request, redirect, url_for
from flask_jwt_extended import JWTManager
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity,verify_jwt_in_request
import hmac
import hashlib
import werkzeug
import bcrypt
import smtplib
from email.mime.text import MIMEText
from flask_mail import Mail, Message
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask_socketio import SocketIO, emit,  join_room, leave_room
import functools
from flask_jwt_extended import jwt_required, get_jwt_identity, decode_token
from flask_jwt_extended.exceptions import NoAuthorizationError
import requests

app = Flask(__name__) # Kreira novu instancu Flask aplikacije. `__name__` se koristi za identifikaciju trenutnog modula.


now_utc = datetime.now(pytz.utc) #  Dohvata trenutno vrijeme u UTC vremenskoj zoni pomoću `datetime` i `pytz` biblioteka.
app.secret_key = '' # Postavlja tajni ključ za sesije u Flask aplikaciji. Ovaj ključ se koristi za zaštitu sesijskih podataka.
app.config['JWT_SECRET_KEY'] = ''  # Tajni ključ za potpisivanje tokena
jwt = JWTManager(app) # Inicijalizuje JWTManager sa Flask aplikacijom. Ovo omogućava rad sa JWT tokenima.
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=30) # Postavlja trajanje sesije na 30 dana. Ovo je vrijeme kada će sesija isteći ako korisnik ne koristi aplikaciju.
app.config['SESSION_COOKIE_SECURE'] = False  # Postavlja opciju `SESSION_COOKIE_SECURE` na `False`, što znači da sesijski kolačići neće biti poslati samo preko HTTPS veze.
app.config['SESSION_COOKIE_HTTPONLY'] = True #  Postavlja opciju `SESSION_COOKIE_HTTPONLY` na `True`, što znači da sesijski kolačići neće biti dostupni preko JavaScript-a.
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax' # Omogućava kolačiće da se šalju u većini slučajeva,  ali spriječava slanje kolačića u zahtjevima sa krštenih sajtova (cross-site) koji su podložni CSRF napadima.
# Postavite folder za upload
app.config['UPLOAD_FOLDER'] = 'uploads/' # Postavlja putanju za folder gde će se čuvati uploadovani fajlovi. U ovom slučaju, to je `uploads/` folder.
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif', 'pdf'} # Definiše dozvoljene ekstenzije fajlova koji se mogu uploadovati. U ovom slučaju, to su slike i PDF fajlovi
ALLOWED_EXTENSIONS = {'pdf'}
# Takođe, možete dodati maksimalnu veličinu fajla
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Postavlja maksimalnu veličinu fajla koji se može uploadovati na 16 MB. Ako fajl premašuje ovu veličinu, biće odbijen.
stripe.api_key = "" # Postavlja Stripe API ključ za testiranje. Ovaj ključ omogućava aplikaciji da komunicira sa Stripe servisom za obradu plaćanja.
endpoint_secret = '' #Definiše tajni ključ za Stripe webhook, koji se koristi za verifikaciju zahtjeva koje šalje Stripe kada se događaji vezani za plaćanja dogode.
login_manager = LoginManager() #Kreira instancu `LoginManager`, koja upravlja autentifikacijom korisnika u Flask aplikaciji.
login_manager.init_app(app) # Inicijalizuje `LoginManager` sa Flask aplikacijom. Ovo omogućava aplikaciji da koristi LoginManager za upravljanje prijavama.
socketio = SocketIO(app, cors_allowed_origins="*") # Inicijalizuje SocketIO sa Flask aplikacijom, omogućavajući WebSocket komunikaciju. `cors_allowed_origins="*"` omogućava konekcije sa bilo kog domena.

login_manager.login_view = 'login'  #Postavlja naziv rute za login stranicu. Kada korisnik pokuša da pristupi zaštićenim resursima preusmjeriti će ga na login stranicu
logging.basicConfig(level=logging.DEBUG) #Konfiguriše osnovne postavke za logovanje u Python aplikaciji. Postavlja nivo logovanja na `DEBUG`, što omogućava bilježenje svih poruka od nivoa `DEBUG` pa naviše.
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}}) #Omogućava Cross-Origin Resource Sharing (CORS) za Flask aplikaciju. `supports_credentials=True` omogućava slanje kolačića sa zahtjeva sa drugih domena. `resources={r"/*": {"origins": "*"}}` omogućava zahtjeve sa svih domena.
API_KEY = ''  # OpenWeatherMap API ključ
CITY = 'Bihać'
WEATHER_URL = f'http://api.openweathermap.org/data/2.5/weather?q={CITY}&appid={API_KEY}&units=metric'


# Definira putanju gdje će se pohranjivati uploadani fajlovi (npr. slike ili dokumenti).
UPLOAD_FOLDER = 'uploads'

# Funkcija koja uspostavlja konekciju s MySQL bazom podataka koristeći zadane parametre.
def get_db_connection():
    # Vraća MySQL vezu koristeći podatke za prijavu (host, korisnik, lozinka, baza).
    return connect(
        host="localhost",   # Adresa hosta (u ovom slučaju lokalni server)
        user="root",        # Korisničko ime za MySQL (u ovom slučaju 'root')
        passwd="12345",     # Lozinka za MySQL (u ovom slučaju '12345')
        database="bazza"    # Naziv baze podataka (u ovom slučaju 'bazza')
    )

# Biblioteka koji pohranjuje konfiguracijske podatke za povezivanje s bazom podataka.
db_config = {
    'user': 'root',          # Korisničko ime
    'password': '12345',      # Lozinka
    'host': 'localhost',      # Host server (lokalni)
    'database': 'bazza'       # Naziv baze podataka
}

# Klasa 'User' nasljeđuje 'UserMixin', što omogućava da se ponaša kao korisnički objekt za autentifikaciju.
class User(UserMixin):
    # Konstruktor klase koji prima id, ime, prezime, email i ulogu korisnika.
    def __init__(self, id, first_name, last_name, email, role):
        self.id = id                # ID korisnika
        self.first_name = first_name # Ime korisnika
        self.last_name = last_name   # Prezime korisnika
        self.email = email           # Email adresa korisnika
        self.role = role             # Uloga korisnika (npr. admin, user, itd.)

    # Funkcija koja vraća korisnikov ID kao string (potrebno za autentifikaciju korisnika).
    def get_id(self):
        return str(self.id)

# Funkcija koja učitava korisnika iz baze podataka na temelju njegovog ID-a.
def load_user(user_id):
    try:
        # Uspostavlja konekciju s bazom podataka.
        connection = get_db_connection()
        # Stvara kursor koji vraća rezultate kao rječnik (dictionary=True).
        cursor = connection.cursor(dictionary=True)
        # Izvršava SQL upit za dohvaćanje korisnika čiji ID odgovara proslijeđenom user_id.
        cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        # Dohvaća prvog pronađenog korisnika (ako postoji).
        user = cursor.fetchone()
        # Zatvara kursor.
        cursor.close()
        # Zatvara konekciju s bazom podataka.
        connection.close()

        # Ako je korisnik pronađen, vraća instancu klase 'User' s podacima iz baze.
        if user:
            return User(id=user['id'], first_name=user['first_name'], last_name=user['last_name'], email=user['email'], role=user['role'])
        # Ako korisnik nije pronađen, vraća None.
        return None
    # Ako dođe do greške prilikom dohvaćanja korisnika, hvata iznimku.
    except Exception as e:
        # Bilježi grešku u loggeru aplikacije.
        app.logger.error(f"Error loading user: {e}")
        # Vraća None u slučaju greške.
        return None




# Funkcija koja generira API ključ na temelju korisničkog ID-a koristeći HMAC i SHA-256 algoritam.
def generate_api_key(user_id):
    # Tajni ključ koji se koristi za generiranje API ključa.
    secret = 'a3c0f2b4e3d3c9a9e4b7a6e7d3a8b9c6'
    # Vraća HMAC hash izračunat koristeći tajni ključ i korisnički ID, te algoritam SHA-256.
    return hmac.new(secret.encode(), user_id.encode(), hashlib.sha256).hexdigest()



# Definira rutu '/register' koja prihvata POST zahtjeve za registraciju korisnika.
@app.route('/register', methods=['POST'])
def register():
    try:
        # Pokušava dobiti podatke iz tijela POST zahtjeva u formatu JSON.
        data = request.get_json()

        # Dohvata podatke iz JSON-a koristeći ključeve za svako polje.
        first_name = data.get('firstName')  # Ime korisnika
        last_name = data.get('lastName')    # Prezime korisnika
        email = data.get('email')           # Email korisnika
        password = data.get('password')     # Lozinka korisnika
        gender = data.get('gender')         # Spol korisnika
        phone_number = data.get('phoneNumber')  # Broj telefona korisnika
        country = data.get('country')       # Država korisnika
        city = data.get('city')             # Grad korisnika
        address = data.get('address')       # Adresa korisnika
        postal_code = data.get('postalCode')  # Poštanski broj korisnika

        # Provjerava da li su sva obavezna polja popunjena.
        if not (first_name and last_name and email and password and gender and phone_number and country and city and address and postal_code):
            # Ako neko od polja nedostaje, vraća poruku o greški s HTTP status kodom 400 (Bad Request).
            return jsonify({"error": "All fields are required"}), 400

        # Generira hash lozinke koristeći funkciju za sigurnu pohranu lozinki.
        password_hash = generate_password_hash(password)

        # Uspostavlja konekciju s bazom podataka.
        connection = get_db_connection()
        cursor = connection.cursor()

        # SQL upit za umetanje novog korisnika u tabelu 'users'.
        query = """
        INSERT INTO users (first_name, last_name, email, gender, phone_number, country, city, address, postal_code, password_hash, role)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'donor')
        """
        # Vrednosti koje će biti ubačene u SQL upit (parametri upita).
        values = (first_name, last_name, email, gender, phone_number, country, city, address, postal_code, password_hash)

        # Izvršava SQL upit sa specificiranim vrednostima.
        cursor.execute(query, values)
        
        # Potvrđuje promjene u bazi podataka.
        connection.commit()

        # Zatvara kursor nakon što je upit izvršen.
        cursor.close()

        # Zatvara konekciju s bazom podataka.
        connection.close()

        # Vraća JSON odgovor s porukom o uspješnoj registraciji i HTTP status kodom 201 (Created).
        return jsonify({"message": "Registration successful"}), 201

    # Hvata bilo kakve greške koje se pojave tokom obrade.
    except Exception as e:
        # Vraća JSON odgovor s detaljima greške i HTTP status kodom 500 (Internal Server Error).
        return jsonify({"error": str(e)}), 500

    


@app.route('/login', methods=['POST']) #Definiše rutu za `/login` koja prihvata samo POST zahteve. Ova ruta je povezana sa funkcijom `login`.
def login():
    data = request.get_json() #Dohvata JSON podatke iz tijela POST zahtjeva i skladišti ih u promjenljivu `data`.
    email = data.get('email')
    password = data.get('password')
    remember_me = data.get('remember_me', False)
 # Ekstrahuje vrednosti iz JSON objekta: email, password i remember_me. Ako `remember_me` nije prisutan, podrazumjevana vrijednost je `False`.
    try:
        connection = get_db_connection() # Poziva funkciju `get_db_connection()` da dobije vezu sa bazom podataka.
        cursor = connection.cursor(dictionary=True) #Kreira novi kursor za izvođenje SQL upita. Parametar `dictionary=True` omogućava da rezultati budu vraćeni kao redovi.
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,)) #Izvršava SQL upit da se pronađe korisnik sa navedenim email-om u tabeli `users`.
        user = cursor.fetchone() #Dohvata jedan red rezultata upita (ako postoji) i skladišti ga u promenljivu `user`.
        cursor.close()
        connection.close() #Zatvara kursor i vezu sa bazom podataka.

        if user and check_password_hash(user['password_hash'], password):
            #Provjerava da li korisnik postoji i da li se unesena lozinka poklapa sa hash-iranom lozinkom iz baze podataka.
            user_obj = User(id=user['id'], first_name=user['first_name'], last_name=user['last_name'], email=user['email'], role=user['role'])
            #Kreira objekat `User` sa podacima korisnika.
            # Kreirajte JWT token
            access_token = create_access_token(identity=user['id'])

            # Prijavite korisnika u Flask-Login
            login_user(user_obj, remember=remember_me)
            #Prijavljuje korisnika u Flask-Login sistem koristeći `login_user` funkciju. Ako je `remember_me` `True`, korisnik će ostati prijavljen i nakon zatvaranja pretraživača.

            return jsonify({
                "message": "Login successful",
                "access_token": access_token,  # Vratite JWT token
                "user": {
                    "id": user['id'],
                    "first_name": user['first_name'],
                    "last_name": user['last_name'],
                    "email": user['email'],
                    "role": user['role']
                }
            }), 200 #Vraća JSON odgovor sa porukom o uspešnoj prijavi, JWT tokenom i informacijama o korisniku. HTTP status kod 200 označava uspešan zahtjev.
        else:
            return jsonify({"error": "Invalid email or password"}), 401 #Ako korisnik ne postoji ili lozinke se ne poklapaju, vraća JSON odgovor sa porukom o grešci i HTTP status kod 401 (Neautorizovan).

    except Error as e:
        return jsonify({"error": str(e)}), 500 #Ako dođe do greške u izvođenju upita ili povezivanju sa bazom podataka, vraća JSON odgovor sa opisom greške i HTTP status kod 500 (Internal Server Error).

@app.route('/')
def home():
    return 'Test endpoint is working!'

@app.route('/logout', methods=['POST']) # Definicija funkcije 'logout' koja će se izvršiti prilikom POST zahtjeva na '/logout'.
def logout():
    session.clear()   # Čisti sve podatke iz trenutne sesije, odjavljujući korisnika.
    return jsonify({"message": "Logged out successfully"}), 200 # Vraća JSON odgovor koji potvrđuje uspješnu odjavu uz HTTP status 200.

@app.route('/session', methods=['GET']) # Definicija funkcije 'check_session' koja će se izvršiti prilikom GET zahtjeva na '/session'.
def check_session():
    if 'user_id' in session:     # Provjerava postoji li 'user_id' ključ u sesiji, što znači da je korisnik prijavljen.
        return jsonify({"message": "Session is active"}), 200     # Ako sesija postoji, vraća JSON odgovor s porukom da je sesija aktivna i status 200.
    else:
        return jsonify({"message": "No active session"}), 401 # Ako nema aktivne sesije (nema 'user_id' u sesiji), vraća poruku da nema sesije uz status 401.

@app.route('/admin/add_user', methods=['POST']) # Definicija funkcije 'add_user' koja će se izvršiti prilikom POST zahtjeva na '/admin/add_user'.
def add_user():
    try:
        data = request.get_json()  # Dohvaća podatke u JSON formatu iz tijela zahtjeva (request body).
        print("Received data:", data)  
  # Dohvaća pojedinačne vrijednosti iz primljenih podataka. Ako vrijednost ne postoji, vraća None.
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        email = data.get('email')
        password = data.get('password')
        gender = data.get('gender')
        phone_number = data.get('phone_number')
        country = data.get('country')
        city = data.get('city')
        address = data.get('address')
        postal_code = data.get('postal_code')
        role = data.get('role')
 # Provjerava jesu li sva polja prisutna. Ako nedostaju, kreira listu nedostajućih polja i vraća grešku.
        if not all([first_name, last_name, email, password, gender, phone_number, country, city, address, postal_code, role]):
            missing_fields = [field for field in ['first_name', 'last_name', 'email', 'password', 'gender', 'phone_number', 'country', 'city', 'address', 'postal_code', 'role'] if not data.get(field)]
            return jsonify({"error": f"Missing fields: {', '.join(missing_fields)}"}), 400

     # Ispisuje vrijednosti varijabli radi provjere.
        print(f"Variables: {first_name}, {last_name}, {email}, {gender}, {phone_number}, {country}, {city}, {address}, {postal_code}, {role}")
          # Generira hash lozinke kako bi se lozinka sigurno pohranila u bazi.
        password_hash = generate_password_hash(password)
        print("Password hash:", password_hash) 
         # Povezuje se na bazu podataka pomoću funkcije 'get_db_connection'.
        connection = get_db_connection()
        if connection is None:
            return jsonify({"error": "Database connection failed"}), 500  # Ako veza s bazom nije uspostavljena, vraća grešku s porukom.
# Otvara kursor za izvršavanje SQL naredbi unutar bloka 'with', što automatski zatvara kursor nakon izvršenja.
        with connection.cursor() as cursor:
             # SQL upit za umetanje podataka u tablicu 'users'.
            query = """  
            INSERT INTO users (first_name, last_name, email, gender, phone_number, country, city, address, postal_code, password_hash, role)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            # Vrijednosti koje će se umetnuti u upit.
            values = (first_name, last_name, email, gender, phone_number, country, city, address, postal_code, password_hash, role)
            try:
                cursor.execute(query, values) # Izvršava SQL upit s pripremljenim vrijednostima.
                connection.commit()   # Potvrđuje transakciju kako bi se promjene pohranile u bazu.
            except Exception as e:
                print("SQL Error:", e)  
                return jsonify({"error": "Failed to insert data into database"}), 500  # Ako dođe do greške prilikom izvršenja SQL upita, ispisuje grešku i vraća poruku o neuspjehu.

        return jsonify({"message": "User added successfully"}), 201  # Vraća uspješan odgovor s porukom i statusom 201 (Created).

    except Exception as e: # Hvata bilo koju iznimku koja se dogodi tijekom izvršenja funkcije.
        print("Exception:", e) 
        return jsonify({"error": str(e)}), 500

    
# Definira rutu '/admin/users' koja prihvata GET zahtjeve i vraća listu korisnika.
@app.route('/admin/users', methods=['GET'])
def get_users():
    try:
        # Uspostavlja konekciju s bazom podataka.
        connection = get_db_connection()

        # Kreira kursor koji vraća rezultate kao biblioteku (dictionary=True).
        cursor = connection.cursor(dictionary=True)

        # Izvršava SQL upit koji dohvaća sve korisnike i njihove informacije.
        cursor.execute("SELECT id, first_name, last_name, email, gender, phone_number, country, city, address, postal_code, role FROM users")

        # Dohvata sve korisnike kao listu iz biblioteke.
        users = cursor.fetchall()

        # Zatvara kursor.
        cursor.close()

        # Zatvara konekciju s bazom podataka.
        connection.close()

        # Vraća listu korisnika u JSON formatu s HTTP statusom 200 (OK).
        return jsonify(users), 200

    # Hvata bilo kakve greške i vraća poruku o greški u JSON formatu s HTTP statusom 500 (Internal Server Error).
    except Exception as e:
        return jsonify({"error": str(e)}), 500



# Definira rutu '/admin/update_user/<int:user_id>' koja prihvata PUT zahtjeve za ažuriranje korisnika.
@app.route('/admin/update_user/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    try:
        # Dobiva JSON podatke iz tijela zahtjeva.
        data = request.get_json()

        # Dohvata pojedinačna polja iz JSON podataka.
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        email = data.get('email')
        password = data.get('password')  # Ovo polje je opcionalno
        gender = data.get('gender')
        phone_number = data.get('phone_number')
        country = data.get('country')
        city = data.get('city')
        address = data.get('address')
        postal_code = data.get('postal_code')
        role = data.get('role')

        # Provjerava da li su sva obavezna polja prisutna. Ako nešto nedostaje, vraća poruku o grešci.
        if not all([first_name, last_name, email, gender, phone_number, country, city, address, postal_code, role]):
            missing_fields = [field for field in ['first_name', 'last_name', 'email', 'gender', 'phone_number', 'country', 'city', 'address', 'postal_code', 'role'] if not data.get(field)]
            return jsonify({"error": f"Missing fields: {', '.join(missing_fields)}"}), 400

        # Ako je lozinka postavljena, generira hash za lozinku. Ako nije, postavlja 'None'.
        password_hash = generate_password_hash(password) if password else None

        # Uspostavlja konekciju s bazom podataka.
        connection = get_db_connection()
        if connection is None:
            return jsonify({"error": "Database connection failed"}), 500

        # Koristi kontekst menadžer za izvršavanje upita s kursorom.
        with connection.cursor() as cursor:
            # Priprema SQL upit za ažuriranje korisnika.
            query = """
            UPDATE users
            SET first_name = %s, last_name = %s, email = %s, gender = %s, phone_number = %s, country = %s, city = %s, address = %s, postal_code = %s, role = %s
            """
            values = (first_name, last_name, email, gender, phone_number, country, city, address, postal_code, role)

            # Ako je lozinka prisutna, dodaje polje 'password_hash' u SQL upit.
            if password_hash:
                query += ", password_hash = %s"
                values += (password_hash,)

            # Dodaje WHERE klauzulu za ažuriranje korisnika prema ID-u.
            query += " WHERE id = %s"
            values += (user_id,)

            # Izvršava SQL upit sa specificiranim vrijednostima.
            cursor.execute(query, values)

            # Potvrđuje promjene u bazi podataka.
            connection.commit()

        # Vraća poruku o uspješnom ažuriranju.
        return jsonify({"message": "User updated successfully"}), 200

    # Hvata bilo kakve greške i vraća ih kao odgovor s HTTP statusom 500.
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    
# Definira rutu '/admin/delete_user/<int:user_id>' koja prihvata DELETE zahtjeve za brisanje korisnika.
@app.route('/admin/delete_user/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        # Uspostavlja konekciju s bazom podataka.
        connection = get_db_connection()
        if connection is None:
            return jsonify({"error": "Database connection failed"}), 500

        # Koristi kontekst menadžer za izvršavanje SQL upita.
        with connection.cursor() as cursor:
            # Provjerava da li korisnik postoji prema ID-u.
            cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
            user = cursor.fetchone()

            # Ako korisnik ne postoji, vraća grešku 404 (Not Found).
            if user is None:
                return jsonify({"error": "User not found"}), 404

            # Izvršava SQL upit za brisanje korisnika prema ID-u.
            cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
            connection.commit()

        # Vraća poruku o uspješnom brisanju.
        return jsonify({"message": "User deleted successfully"}), 200

    # Hvata bilo kakve greške i vraća ih kao odgovor s HTTP statusom 500.
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/admin/upload_report', methods=['POST']) # Ova ruta definiše endpoint '/admin/upload_report' koji prihvata samo POST zahtjeve.
@login_required # @login_required osigurava da samo prijavljeni korisnici mogu pristupiti ovoj funkciji.
def upload_report():
    # Provjera da li je korisnik admin
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized access"}), 403     # Ako trenutni korisnik nije admin, vraća grešku 403 (zabranjeno).

    if 'file' not in request.files: # Provjera da li u zahtjevu postoji fajl.
        app.logger.debug("No file part in the request.")
        return jsonify({"error": "No file part"}), 400 # Ako fajl nije poslan, loguje se poruka i vraća greška 400 (neispravan zahtjev).

    file = request.files['file']  # Dohvata se fajl iz zahtjeva.
    title = request.form.get('title')    # Dohvata se naslov izvještaja iz forme.

    if file.filename == '':  # Provjera da li je ime fajla prazno.
        app.logger.debug("No selected file.")
        return jsonify({"error": "No selected file"}), 400   # Ako ime fajla nije odabrano, loguje se poruka i vraća greška 400.

    if file and allowed_file(file.filename):    # Provjera da li fajl postoji i ima dozvoljen format.
        filename = secure_filename(file.filename)  # Ako je fajl validan, generiše se sigurno ime fajla.
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)  # Kreira se putanja za spremanje fajla.
        file.save(file_path)   # Fajl se sprema na server.

        uploaded_by = current_user.id  # Dohvata se ID korisnika koji je prijavljen.
        app.logger.debug("User ID from session: %s", uploaded_by) # Loguje se ID korisnika.

        try:
            connection = get_db_connection() # Pokušaj uspostavljanja konekcije s bazom podataka.
            cursor = connection.cursor()
             # SQL upit za unos podataka o izvještaju u bazu.
            query = """
            INSERT INTO reports (title, file_path, uploaded_by)
            VALUES (%s, %s, %s)
            """
            values = (title, file_path, uploaded_by) # Vrijednosti za unos (naslov, putanja do fajla, ID korisnika).
            cursor.execute(query, values) # Izvršava se upit s vrijednostima.
            connection.commit()  # Potvrđuje se transakcija.
            cursor.close()
            connection.close() # Zatvara se kursor i konekcija s bazom.
        except Exception as e:
            app.logger.error("Database error: %s", str(e))
            return jsonify({"error": "Failed to save report"}), 500  # Ako dođe do greške, loguje se greška i vraća se status 500 (server error).

        return jsonify({"message": "File successfully uploaded"}), 201   # Ako je sve uspješno, vraća se poruka o uspješnom uploadu fajla s kodom 201 (kreirano).
    else:
        app.logger.debug("Invalid file format.")
        return jsonify({"error": "Invalid file format"}), 400  # Ako fajl nije validan, loguje se poruka i vraća greška 400 (neispravan format fajla).



@app.route('/admin/get_reports', methods=['GET']) # Ova ruta omogućava dohvaćanje svih izvještaja iz baze podataka.
def get_reports():
    connection = get_db_connection()  # Povezivanje s bazom podataka.
    cursor = connection.cursor(dictionary=True) # Kreira kursor koji omogućava izvršavanje SQL upita.
    cursor.execute('SELECT * FROM reports')   # Izvršava SQL upit koji dohvaća sve zapise iz tabele 'reports'.
    reports = cursor.fetchall() # Dohvata sve rezultate upita i sprema ih u varijablu 'reports'.
    cursor.close() # Zatvara kursor, čime se oslobađaju resursi korišteni za izvršavanje upita.
    connection.close()  # Zatvara konekciju s bazom podataka.
    return jsonify(reports) # Vraća rezultate u JSON formatu kao HTTP odgovor.

@app.route('/admin/update_report/<int:report_id>', methods=['PUT']) # Ova ruta omogućava ažuriranje izvještaja sa specifičnim ID-om (report_id).
def update_report(report_id):
    connection = get_db_connection() # Povezivanje s bazom podataka.
    cursor = connection.cursor()  # Kreiranje kursora za izvršavanje SQL upita.
    
    # Uzmite podatke iz formData
    title = request.form.get('title') # Uzimanje naslova iz forme.
    file = request.files.get('file')  # Uzimanje fajla iz forme (ako je priložen novi fajl).
    
    # Pronađite izvještaj po ID-u
    cursor.execute('SELECT * FROM reports WHERE id = %s', (report_id,))
    report = cursor.fetchone()
    
    if not report:
        cursor.close()
        connection.close()         # Zatvaranje kursora i konekcije prije povratka odgovora.
        return jsonify({'error': 'Report not found'}), 404 # Ako izvještaj s navedenim ID-om ne postoji, vraća se greška 404 (nije pronađeno).

    # Ažurirajte naslov izvještaja
    cursor.execute('UPDATE reports SET title = %s WHERE id = %s', (title, report_id)) # Ažuriranje naslova izvještaja u bazi podataka.
    
    # Ako je nova slika priložena, ažurirajte naziv slike
    if file:
        file_name = file.filename  # Uzimanje imena priloženog fajla.
        file.save(os.path.join('uploads', file_name))  # Spremanje fajla na server u folder 'uploads'.
        cursor.execute('UPDATE reports SET file_name = %s WHERE id = %s', (file_name, report_id))  # Ažuriranje naziva fajla u bazi podataka za taj izvještaj.

    connection.commit()  # Potvrđivanje svih promjena u bazi podataka.
    cursor.close()
    connection.close() # Zatvaranje kursora i konekcije s bazom.
    return jsonify({'success': 'Report updated successfully'}) # Vraća se JSON odgovor s porukom o uspješnom ažuriranju.


# Ruta za brisanje izvještaja
@app.route('/admin/delete_report/<int:id>', methods=['DELETE'])
def delete_report(id):
    connection = get_db_connection()  # Povezivanje s bazom podataka.
    cursor = connection.cursor() # Kreiranje kursora za izvršavanje SQL upita

    # Upit za brisanje izvještaja prema ID-ju
    cursor.execute('DELETE FROM reports WHERE id = %s', (id,)) # Izvršavanje SQL upita za brisanje izvještaja s navedenim ID-jem.
    connection.commit() # Potvrđivanje promjene (brisanja) u bazi podataka.

    cursor.close() # Zatvaranje kursora, čime se oslobađaju resursi korišteni za izvršavanje upita.
    connection.close()     # Zatvaranje konekcije s bazom podataka.
    
    return jsonify({'message': 'Report deleted successfully'}), 200  # Vraćanje JSON odgovora s porukom o uspješnom brisanju i statusom 200 (OK).


@app.route('/admin/upload_regulation', methods=['POST'])
@login_required #osigurava da samo prijavljeni korisnici mogu pristupiti ovoj funkciji.
def upload_regulation():
    if current_user.role != 'admin':  # Provjera da li trenutni korisnik ima ulogu 'admin'. 
        return jsonify({"error": "Unauthorized access"}), 403   # Ako nije admin, vraća se greška 403 (zabranjen pristup).

    if 'file' not in request.files:   # Provjera da li je fajl priložen u zahtjevu.
        return jsonify({"error": "No file part"}), 400    # Ako fajl nije priložen, vraća se greška 400 (pogrešan zahtjev).

    file = request.files['file']    # Dohvatanje fajla iz zahtjeva.
    title = request.form.get('title') # Dohvatanje naslova pravilnika iz forme (koristi se formData).

    if file.filename == '':  # Provjera da li je korisnik odabrao fajl (provjerava se naziv fajla).
        return jsonify({"error": "No selected file"}), 400  # Ako nije odabran nijedan fajl, vraća se greška 400.

    if file and allowed_file(file.filename): # Provjera da li je priloženi fajl validan (koristi se funkcija `allowed_file`).
        filename = secure_filename(file.filename)  # Sigurno preimenovanje fajla kako bi se izbjegle potencijalne sigurnosne prijetnje.
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename) # Kreiranje putanje gdje će fajl biti sačuvan na serveru.
        file.save(file_path)  # Spremanje fajla na prethodno definisanu putanju.

        uploaded_by = current_user.id # Sprema ID trenutnog korisnika koji uploaduje fajl.

        try:
            connection = get_db_connection()   # Povezivanje s bazom podataka.
            cursor = connection.cursor() # Kreiranje kursora za izvršavanje SQL upita.
             # SQL upit za unos podataka o pravilnika u tabelu 'regulations'.
            query = """
            INSERT INTO regulations (title, file_path, uploaded_by)
            VALUES (%s, %s, %s)
            """
            values = (title, file_path, uploaded_by) # Vrijednosti koje će biti ubačene u bazu podataka.
            cursor.execute(query, values)   # Izvršavanje SQL upita s navedenim vrijednostima.
            connection.commit() # Potvrđivanje promjena u bazi podataka.
            cursor.close()  # Zatvaranje kursora nakon izvršenog upita.
            connection.close() # Zatvaranje konekcije s bazom podataka.
        except Exception as e:
            return jsonify({"error": "Failed to save regulation"}), 500 # Ako dođe do greške tokom upisa u bazu, vraća se greška 500 (interni server error).

        return jsonify({"message": "Regulation successfully uploaded"}), 201 # Ako je upload uspješan, vraća se poruka o uspjehu s kodom 201 (kreirano).
    else:
        return jsonify({"error": "Invalid file format"}), 400    # Ako fajl nije validnog formata, vraća se greška 400.
    

@app.route('/admin/get_regulations', methods=['GET']) # Ova ruta omogućava dohvaćanje svih pravilnika iz baze podataka.
def get_regulations():
    connection = get_db_connection()   # Povezivanje s bazom podataka.
    cursor = connection.cursor(dictionary=True) # Kreiranje kursora za izvršavanje SQL upita.
    cursor.execute('SELECT * FROM regulations')  # Izvršavanje SQL upita za dohvaćanje svih zapisa iz tabele 'regulations'.
    regulations = cursor.fetchall() # Dohvaćanje svih rezultata upita.
    cursor.close() # Zatvaranje kursora nakon izvršenog upita.
    connection.close() # Zatvaranje konekcije s bazom podataka.
    return jsonify(regulations)  # Vraćanje rezultata u obliku JSON odgovora.



@app.route('/admin/update_regulation/<int:regulation_id>', methods=['PUT']) # Ova ruta prihvata PUT zahtjeve koji se koriste za ažuriranje postojećih pravilnika.
@login_required
def update_regulation(regulation_id):
    if current_user.role != 'admin': # Provjerava da li je trenutni korisnik admin.
        return jsonify({"error": "Unauthorized access"}), 403  # Ako nije admin, vraća se JSON odgovor s greškom i statusnim kodom 403 (zabranjeno).

    connection = get_db_connection()    # Povezivanje s bazom podataka.
    cursor = connection.cursor()  # Kreiranje kursora za izvršavanje SQL upita.

    title = request.form.get('title')  # Uzimanje novog naslova iz forme.
    file = request.files.get('file')  # Uzimanje datoteke ako je priložena.

    cursor.execute('SELECT * FROM regulations WHERE id = %s', (regulation_id,))    # Izvršavanje SQL upita za dohvaćanje regulative po ID-u.
    regulation = cursor.fetchone()   # Dohvata jedan rezultat iz baze.

    if not regulation:  # Ako regulativa s datim ID-jem ne postoji, vraća se poruka o grešci i statusni kod 404 (nije pronađeno).
        cursor.close()
        connection.close()
        return jsonify({'error': 'Regulation not found'}), 404

    cursor.execute('UPDATE regulations SET title = %s WHERE id = %s', (title, regulation_id)) # Ažurira naslov regulative u bazi podataka.

    if file:
        file_name = secure_filename(file.filename) 
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], file_name)) # Ako je priložena nova datoteka, sprema je u folder s datotekama.
        cursor.execute('UPDATE regulations SET file_path = %s WHERE id = %s', (file_name, regulation_id))  # Ažurira putanju datoteke u bazi podataka.

    connection.commit()   # Potvrđuje promjene u bazi podataka.
    cursor.close()
    connection.close() # Zatvaranje kursora i konekcije.
    return jsonify({'success': 'Regulation updated successfully'})  # Vraća JSON odgovor koji potvrđuje da je regulativa uspješno ažurirana.



@app.route('/admin/delete_regulation/<int:id>', methods=['DELETE']) # Definiše rutu '/admin/delete_regulation' koja prihvata DELETE zahtjeve.
def delete_regulation(id):
    connection = get_db_connection()  # Povezivanje s bazom podataka.
    cursor = connection.cursor()    # Kreiranje kursora za izvršavanje SQL upita.

    cursor.execute('DELETE FROM regulations WHERE id = %s', (id,)) # Izvršavanje SQL upita za brisanje pravilnika s datim ID-jem.
    connection.commit() # Potvrđuje promjenu u bazi podataka (brisanje).

    cursor.close()   # Zatvaranje kursora nakon izvršenog upita.
    connection.close()  # Zatvaranje konekcije s bazom podataka.

    return jsonify({'message': 'Regulation deleted successfully'}), 200  # Vraća JSON odgovor koji potvrđuje da je pravilnik uspješno obrisana, sa statusnim kodom 200 (OK).


@app.route('/admin/upload_agreement', methods=['POST'])
@login_required
def upload_agreement():
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized access"}), 403

    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    title = request.form.get('title')

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        uploaded_by = current_user.id

        try:
            connection = get_db_connection()
            cursor = connection.cursor()
            query = """
            INSERT INTO agreements (title, file_path, uploaded_by)
            VALUES (%s, %s, %s)
            """
            values = (title, file_path, uploaded_by)
            cursor.execute(query, values)
            connection.commit()
            cursor.close()
            connection.close()
        except Exception as e:
            return jsonify({"error": "Failed to save agreement"}), 500

        return jsonify({"message": "Agreement successfully uploaded"}), 201
    else:
        return jsonify({"error": "Invalid file format"}), 400


@app.route('/admin/get_agreements', methods=['GET'])
def get_agreements():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute('SELECT * FROM agreements')
    agreements = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(agreements)

@app.route('/admin/update_agreement/<int:agreement_id>', methods=['PUT'])
def update_agreement(agreement_id):
    connection = get_db_connection()
    cursor = connection.cursor()

    title = request.form.get('title')
    file = request.files.get('file')

    cursor.execute('SELECT * FROM agreements WHERE id = %s', (agreement_id,))
    agreement = cursor.fetchone()

    if not agreement:
        cursor.close()
        connection.close()
        return jsonify({'error': 'Agreement not found'}), 404

    cursor.execute('UPDATE agreements SET title = %s WHERE id = %s', (title, agreement_id))

    if file:
        file_name = secure_filename(file.filename)
        file.save(os.path.join('uploads', file_name))
        cursor.execute('UPDATE agreements SET file_path = %s WHERE id = %s', (file_name, agreement_id))

    connection.commit()
    cursor.close()
    connection.close()
    return jsonify({'success': 'Agreement updated successfully'})

@app.route('/admin/delete_agreement/<int:id>', methods=['DELETE'])
def delete_agreement(id):
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute('DELETE FROM agreements WHERE id = %s', (id,))
    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({'message': 'Agreement deleted successfully'}), 200

@app.route('/admin/upload_procurement', methods=['POST'])
@login_required
def upload_procurement():
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized access"}), 403

    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    title = request.form.get('title')

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        uploaded_by = current_user.id

        try:
            connection = get_db_connection()
            cursor = connection.cursor()
            query = """
            INSERT INTO public_procurements (title, file_path, uploaded_by)
            VALUES (%s, %s, %s)
            """
            values = (title, file_path, uploaded_by)
            cursor.execute(query, values)
            connection.commit()
            cursor.close()
            connection.close()
        except Exception as e:
            return jsonify({"error": "Failed to save procurement"}), 500

        return jsonify({"message": "Procurement successfully uploaded"}), 201
    else:
        return jsonify({"error": "Invalid file format"}), 400

@app.route('/admin/get_procurements', methods=['GET'])
def get_procurements():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute('SELECT * FROM public_procurements')
    procurements = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(procurements)

@app.route('/admin/update_procurement/<int:procurement_id>', methods=['PUT'])
@login_required
def update_procurement(procurement_id):
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized access"}), 403

    connection = get_db_connection()
    cursor = connection.cursor()

    title = request.form.get('title')
    file = request.files.get('file')

    cursor.execute('SELECT * FROM public_procurements WHERE id = %s', (procurement_id,))
    procurement = cursor.fetchone()

    if not procurement:
        cursor.close()
        connection.close()
        return jsonify({'error': 'Procurement not found'}), 404

    cursor.execute('UPDATE public_procurements SET title = %s WHERE id = %s', (title, procurement_id))

    if file:
        file_name = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], file_name))
        cursor.execute('UPDATE public_procurements SET file_path = %s WHERE id = %s', (file_name, procurement_id))

    connection.commit()
    cursor.close()
    connection.close()
    return jsonify({'success': 'Procurement updated successfully'})

@app.route('/admin/delete_procurement/<int:id>', methods=['DELETE'])
def delete_procurement(id):
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute('DELETE FROM public_procurements WHERE id = %s', (id,))
    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({'message': 'Procurements deleted successfully'}), 200


# Kreiranje nove donacije (samo za admina)
@app.route('/admin/add_donation', methods=['POST'])
@login_required
def add_donation():
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized access"}), 403

    data = request.get_json()  # Uzmimo JSON podatke
    amount = data.get('amount')

    if not amount:
        return jsonify({"error": "Missing required fields"}), 400

    donor_id = current_user.id  # Pretpostavljamo da `current_user` ima `id` atribut

    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        query = """
        INSERT INTO donations (donor_id, amount)
        VALUES (%s, %s)
        """
        values = (donor_id, amount)
        cursor.execute(query, values)
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({"message": "Donation successfully added"}), 201
    except Exception as e:
        return jsonify({"error": f"Failed to add donation: {str(e)}"}), 500


# API ruta za dohvaćanje liste donacija sa imenom i prezimenom donora
@app.route('/admin/list_donations', methods=['GET'])
def admin_list_donations():
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # Postavite vremensku zonu na 'Europe/Belgrade' za ovu sesiju
        cursor.execute("SET time_zone = 'Europe/Belgrade'")

        sql = """SELECT d.id, d.donor_id, d.amount, d.donation_date, d.transaction_id, d.payment_status, u.first_name, u.last_name
                 FROM donations d
                 JOIN users u ON d.donor_id = u.id"""
        cursor.execute(sql)
        donations = cursor.fetchall()
        cursor.close()
        connection.close()

        # Pretvorite datum i vrijeme u lokalno vrijeme 'Europe/Belgrade'
        local_tz = pytz.timezone('Europe/Belgrade')
        for donation in donations:
            # Pretvorite UTC vrijeme u lokalno vrijeme
            donation['donation_date'] = donation['donation_date'].astimezone(local_tz).strftime('%Y-%m-%d %H:%M:%S')

        return jsonify(donations)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/admin/update_donation/<int:donation_id>', methods=['PUT'])
@login_required
def update_donation(donation_id):
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized access"}), 403

    data = request.get_json()  # Uzmimo JSON podatke
    amount = data.get('amount')
    donor_id = data.get('donor_id')

    if not amount or not donor_id:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute('SELECT * FROM donations WHERE id = %s', (donation_id,))
        donation = cursor.fetchone()

        if not donation:
            cursor.close()
            connection.close()
            return jsonify({'error': 'Donation not found'}), 404

        cursor.execute('UPDATE donations SET amount = %s, donor_id = %s WHERE id = %s', (amount, donor_id, donation_id))
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({'success': 'Donation updated successfully'})
    except Exception as e:
        return jsonify({"error": f"Failed to update donation: {str(e)}"}), 500



@app.route('/admin/delete_donation/<int:donation_id>', methods=['DELETE'])
@login_required
def delete_donation(donation_id):
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized access"}), 403

    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute('DELETE FROM donations WHERE id = %s', (donation_id,))
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({'message': 'Donation deleted successfully'}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to delete donation: {str(e)}"}), 500

@app.route('/admin/upload_news', methods=['POST'])
@login_required
def upload_news():
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized access"}), 403

    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    title = request.form.get('title')
    description = request.form.get('description')

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        uploaded_by = current_user.id

        try:
            connection = get_db_connection()
            cursor = connection.cursor()
            query = """
            INSERT INTO news (title, description, image_path, uploaded_by)
            VALUES (%s, %s, %s, %s)
            """
            values = (title, description, file_path, uploaded_by)
            cursor.execute(query, values)
            connection.commit()
            cursor.close()
            connection.close()
        except Exception as e:
            return jsonify({"error": "Failed to save news"}), 500

        return jsonify({"message": "News successfully uploaded"}), 201
    else:
        return jsonify({"error": "Invalid file format"}), 400

@app.route('/admin/get_news', methods=['GET'])
def get_news():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute('SELECT * FROM news')
    news_items = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(news_items)

@app.route('/admin/update_news/<int:news_id>', methods=['PUT'])
@login_required
def update_news(news_id):
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized access"}), 403

    connection = get_db_connection()
    cursor = connection.cursor()

    title = request.form.get('title')
    description = request.form.get('description')
    file = request.files.get('file')

    cursor.execute('SELECT * FROM news WHERE id = %s', (news_id,))
    news_item = cursor.fetchone()

    if not news_item:
        cursor.close()
        connection.close()
        return jsonify({'error': 'News item not found'}), 404

    cursor.execute('UPDATE news SET title = %s, description = %s WHERE id = %s', (title, description, news_id))

    if file:
        file_name = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file_name)
        file.save(file_path)
        cursor.execute('UPDATE news SET image_path = %s WHERE id = %s', (file_path, news_id))

    connection.commit()
    cursor.close()
    connection.close()
    return jsonify({'success': 'News item updated successfully'})

@app.route('/admin/delete_news/<int:news_id>', methods=['DELETE'])
def delete_news(news_id):
    print(f"Received request to delete news with ID: {news_id}")  # Debug print
    try:
        conn = mysql.connector.connect(user='root', password='12345', host='localhost', database='bazza')
        cursor = conn.cursor()
        cursor.execute('DELETE FROM news WHERE id = %s', (news_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'News item deleted successfully'}), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'Failed to delete news item'}), 500

@app.route('/admin/add_child', methods=['POST']) # Definiše rutu '/admin/add_child' koja prihvata POST zahtjeve za dodavanje djeteta.
@login_required
def admin_add_child():
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized access"}), 403  # Provjerava da li je trenutni korisnik admin. Ako nije, vraća status 403 (zabranjeno).
    # Uzimanje podataka iz forme koji su poslati u POST zahtjevu.
    first_name = request.form.get('first_name')
    last_name = request.form.get('last_name')
    date_of_birth = request.form.get('date_of_birth')
    date_of_admission = request.form.get('date_of_admission')
    caregiver_id = request.form.get('caregiver_id')
    jmbg = request.form.get('jmbg')
    place_of_birth = request.form.get('place_of_birth')
    image = request.files.get('image')
    parent_name = request.form.get('parent_name')
    notes = request.form.get('notes')

    if image and allowed_file(image.filename):  # Provjerava da li je slika priložena i da li ima ispravan format.
        image_filename = secure_filename(image.filename)  # Ako slika postoji i ispravan je format, koristi se sigurno ime datoteke.
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], image_filename)  # Određuje putanju gdje će se slika sačuvati.
        image.save(image_path)  # Čuva sliku na definisanu putanju.
    else:
        image_path = None   # Ako nema slike, putanja ostaje prazna (None).

    try:
        connection = get_db_connection()  # Pokušava se uspostaviti konekcija s bazom podataka.
        cursor = connection.cursor()
        # SQL upit za unos novog djeteta u bazu podataka.
        query = """
        INSERT INTO children (first_name, last_name, date_of_birth, date_of_admission, caregiver_id, jmbg, place_of_birth, image_path, parent_name, notes)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
         # Definisanje vrijednosti koje će biti umetnute u bazu.
        values = (first_name, last_name, date_of_birth, date_of_admission, caregiver_id, jmbg, place_of_birth, image_path, parent_name, notes)
        cursor.execute(query, values) # Izvršavanje SQL upita sa zadatim vrijednostima.
        connection.commit()  # Potvrđuje promjene u bazi podataka.
        cursor.close() # Zatvaranje kursora i konekcije.
        connection.close()
    except Exception as e:
        app.logger.error("Database error: %s", str(e))
        return jsonify({"error": "Failed to add child"}), 500   # Vraća JSON odgovor sa statusnim kodom 500 (Interna greška servera).

    return jsonify({"message": "Child successfully added"}), 201  # Ako je operacija uspješna, vraća JSON odgovor sa statusom 201 (kreirano).

@app.route('/admin/get_children', methods=['GET']) # Definiše rutu '/admin/get_children' koja koristi GET metodu za dobijanje podataka o djeci.
@login_required
def admin_get_children():
    if current_user.role != 'admin':  # Provjerava da li trenutni korisnik ima ulogu 'admin'. Ako nije admin, vraća statusni kod 403 (zabranjeno).
        return jsonify({"error": "Unauthorized access"}), 403

    connection = get_db_connection()  # Povezuje se na bazu podataka.
    cursor = connection.cursor(dictionary=True) # Kreira kursor koji omogućava izvršavanje SQL upita.
    cursor.execute('SELECT * FROM children') # Izvršava SQL upit koji vraća sve redove iz tabele 'children'.
    children = cursor.fetchall() # Dohvata sve rezultate iz tabele i pohranjuje ih u varijablu 'children'.
    cursor.close()
    connection.close()  # Zatvara konekciju s bazom podataka.
    return jsonify(children) # Vraća listu djece u JSON formatu kao odgovor na zahtjev.

@app.route('/admin/update_child/<int:child_id>', methods=['PUT']) # Definiše rutu '/admin/update_child/<int:child_id>' koja koristi PUT metodu za ažuriranje informacija o djetetu.
@login_required
def admin_update_child(child_id):
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized access"}), 403
      # Dohvata podatke iz zahtjeva (form data i file) za ažuriranje djeteta.
    first_name = request.form.get('first_name')
    last_name = request.form.get('last_name')
    date_of_birth = request.form.get('date_of_birth')
    date_of_admission = request.form.get('date_of_admission')
    caregiver_id = request.form.get('caregiver_id')
    jmbg = request.form.get('jmbg')
    place_of_birth = request.form.get('place_of_birth')
    image = request.files.get('image')
    parent_name = request.form.get('parent_name')
    notes = request.form.get('notes')

    try:
        connection = get_db_connection()  # Povezuje se na bazu podataka.
        cursor = connection.cursor()
       # SQL upit za ažuriranje podataka djeteta u bazi.
        query = """
        UPDATE children SET first_name = %s, last_name = %s, date_of_birth = %s, date_of_admission = %s,
                            caregiver_id = %s, jmbg = %s, place_of_birth = %s, parent_name = %s, notes = %s
        WHERE id = %s
        """
        # Vrijednosti za ažuriranje se pripremaju i šalju u SQL upit.
        values = (first_name, last_name, date_of_birth, date_of_admission, caregiver_id, jmbg, place_of_birth, parent_name, notes, child_id)
        cursor.execute(query, values)
         # Ako je priložena nova slika, provjerava se format i čuva sliku na serveru.
        if image and allowed_file(image.filename):  
            image_filename = secure_filename(image.filename)
            image_path = os.path.join(app.config['UPLOAD_FOLDER'], image_filename)
            image.save(image_path)
            cursor.execute('UPDATE children SET image_path = %s WHERE id = %s', (image_path, child_id))

        connection.commit()  # Spremanje promjena u bazu podataka.
        cursor.close()
        connection.close()  # Zatvaranje kursora i konekcije s bazom podataka.
    except Exception as e:
        app.logger.error("Database error: %s", str(e))
        return jsonify({"error": "Failed to update child"}), 500

    return jsonify({'success': 'Child updated successfully'})   # Ako su promjene uspješno sačuvane, vraća se poruka o uspjehu.


@app.route('/admin/delete_child/<int:child_id>', methods=['DELETE'])
def admin_delete_child(child_id):
    print(f"Received request to delete child with ID: {child_id}")  # Debug print
    try:
        conn = mysql.connector.connect(user='root', password='12345', host='localhost', database='bazza')
        cursor = conn.cursor()
        cursor.execute('DELETE FROM children WHERE id = %s', (child_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Child record deleted successfully'}), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'Failed to delete child record'}), 500

    except Exception as e:
        # Logovanje greške u slučaju problema s bazom
        app.logger.error(f"Error deleting child record: {e}")
        return jsonify({'error': 'Failed to delete child record'}), 500

# Director dashboard

@app.route('/director/upload_procurement', methods=['POST'])
@login_required
def upload_procurement_director():
    if current_user.role != 'director':
        return jsonify({"error": "Unauthorized access"}), 403

    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    title = request.form.get('title')

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        uploaded_by = current_user.id

        try:
            connection = get_db_connection()
            cursor = connection.cursor()
            query = """
            INSERT INTO public_procurements (title, file_path, uploaded_by)
            VALUES (%s, %s, %s)
            """
            values = (title, file_path, uploaded_by)
            cursor.execute(query, values)
            connection.commit()
            cursor.close()
            connection.close()
        except Exception as e:
            return jsonify({"error": "Failed to save procurement"}), 500

        return jsonify({"message": "Procurement successfully uploaded"}), 201
    else:
        return jsonify({"error": "Invalid file format"}), 400

# Ruta za preuzimanje javnih nabavki (dostupna direktorima)
@app.route('/director/get_procurements', methods=['GET'])
@login_required
def get_procurements_director():
    if current_user.role != 'director':
        return jsonify({"error": "Unauthorized access"}), 403

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute('SELECT * FROM public_procurements')
    procurements = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(procurements)

# Ruta za ažuriranje javne nabavke (dostupna direktorima)
@app.route('/director/update_procurement/<int:procurement_id>', methods=['PUT'])
@login_required
def update_procurement_director(procurement_id):
    if current_user.role != 'director':
        return jsonify({"error": "Unauthorized access"}), 403

    connection = get_db_connection()
    cursor = connection.cursor()

    title = request.form.get('title')
    file = request.files.get('file')

    cursor.execute('SELECT * FROM public_procurements WHERE id = %s', (procurement_id,))
    procurement = cursor.fetchone()

    if not procurement:
        cursor.close()
        connection.close()
        return jsonify({'error': 'Procurement not found'}), 404

    cursor.execute('UPDATE public_procurements SET title = %s WHERE id = %s', (title, procurement_id))

    if file:
        file_name = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], file_name))
        cursor.execute('UPDATE public_procurements SET file_path = %s WHERE id = %s', (file_name, procurement_id))

    connection.commit()
    cursor.close()
    connection.close()
    return jsonify({'success': 'Procurement updated successfully'})

# Ruta za dodavanje dokumenata (dostupna direktorima)
@app.route('/director/upload_agreement', methods=['POST'])
@login_required
def upload_agreement_director():
    if current_user.role != 'director':
        return jsonify({"error": "Unauthorized access"}), 403

    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    title = request.form.get('title')

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        uploaded_by = current_user.id

        try:
            connection = get_db_connection()
            cursor = connection.cursor()
            query = """
            INSERT INTO agreements (title, file_path, uploaded_by)
            VALUES (%s, %s, %s)
            """
            values = (title, file_path, uploaded_by)
            cursor.execute(query, values)
            connection.commit()
            cursor.close()
            connection.close()
        except Exception as e:
            return jsonify({"error": "Failed to save agreement"}), 500

        return jsonify({"message": "Agreement successfully uploaded"}), 201
    else:
        return jsonify({"error": "Invalid file format"}), 400

# Ruta za preuzimanje dokumenata (dostupna direktorima)
@app.route('/director/get_agreements', methods=['GET'])
@login_required
def get_agreements_director():
    if current_user.role != 'director':
        return jsonify({"error": "Unauthorized access"}), 403

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute('SELECT * FROM agreements')
    agreements = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(agreements)

# Ruta za ažuriranje dokumenata (dostupna direktorima)
@app.route('/director/update_agreement/<int:agreement_id>', methods=['PUT'])
@login_required
def update_agreement_director(agreement_id):
    if current_user.role != 'director':
        return jsonify({"error": "Unauthorized access"}), 403

    connection = get_db_connection()
    cursor = connection.cursor()

    title = request.form.get('title')
    file = request.files.get('file')

    cursor.execute('SELECT * FROM agreements WHERE id = %s', (agreement_id,))
    agreement = cursor.fetchone()

    if not agreement:
        cursor.close()
        connection.close()
        return jsonify({'error': 'Agreement not found'}), 404

    cursor.execute('UPDATE agreements SET title = %s WHERE id = %s', (title, agreement_id))

    if file:
        file_name = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], file_name))
        cursor.execute('UPDATE agreements SET file_path = %s WHERE id = %s', (file_name, agreement_id))

    connection.commit()
    cursor.close()
    connection.close()
    return jsonify({'success': 'Agreement updated successfully'})


@app.route('/director/upload_report', methods=['POST'])
@login_required
def director_upload_report():
    if current_user.role != 'director':
        return jsonify({"error": "Unauthorized access"}), 403

    if 'file' not in request.files:
        app.logger.debug("No file part in the request.")
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    title = request.form.get('title')

    if file.filename == '':
        app.logger.debug("No selected file.")
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        uploaded_by = current_user.id
        app.logger.debug("User ID from session: %s", uploaded_by)

        try:
            connection = get_db_connection()
            cursor = connection.cursor()
            query = """
            INSERT INTO reports (title, file_path, uploaded_by)
            VALUES (%s, %s, %s)
            """
            values = (title, file_path, uploaded_by)
            cursor.execute(query, values)
            connection.commit()
            cursor.close()
            connection.close()
        except Exception as e:
            app.logger.error("Database error: %s", str(e))
            return jsonify({"error": "Failed to save report"}), 500

        return jsonify({"message": "File successfully uploaded"}), 201
    else:
        app.logger.debug("Invalid file format.")
        return jsonify({"error": "Invalid file format"}), 400

@app.route('/director/get_reports', methods=['GET'])
@login_required
def director_get_reports():
    if current_user.role != 'director':
        return jsonify({"error": "Unauthorized access"}), 403

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute('SELECT * FROM reports')
    reports = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(reports)

@app.route('/director/update_report/<int:report_id>', methods=['PUT'])
@login_required
def director_update_report(report_id):
    if current_user.role != 'director':
        return jsonify({"error": "Unauthorized access"}), 403

    connection = get_db_connection()
    cursor = connection.cursor()

    title = request.form.get('title')
    file = request.files.get('file')

    cursor.execute('SELECT * FROM reports WHERE id = %s', (report_id,))
    report = cursor.fetchone()

    if not report:
        cursor.close()
        connection.close()
        return jsonify({'error': 'Report not found'}), 404

    cursor.execute('UPDATE reports SET title = %s WHERE id = %s', (title, report_id))

    if file:
        file_name = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file_name)
        file.save(file_path)
        cursor.execute('UPDATE reports SET file_path = %s WHERE id = %s', (file_path, report_id))

    connection.commit()
    cursor.close()
    connection.close()
    return jsonify({'success': 'Report updated successfully'})


@app.route('/director/upload_regulation', methods=['POST'])
@login_required
def director_upload_regulation():
    if current_user.role != 'director':
        return jsonify({"error": "Unauthorized access"}), 403

    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    title = request.form.get('title')

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        uploaded_by = current_user.id

        try:
            connection = get_db_connection()
            cursor = connection.cursor()
            query = """
            INSERT INTO regulations (title, file_path, uploaded_by)
            VALUES (%s, %s, %s)
            """
            values = (title, file_path, uploaded_by)
            cursor.execute(query, values)
            connection.commit()
            cursor.close()
            connection.close()
        except Exception as e:
            return jsonify({"error": "Failed to save regulation"}), 500

        return jsonify({"message": "Regulation successfully uploaded"}), 201
    else:
        return jsonify({"error": "Invalid file format"}), 400

# Ruta za dohvat svih regulativa
@app.route('/director/get_regulations', methods=['GET'])
@login_required
def director_get_regulations():
    if current_user.role != 'director':
        return jsonify({"error": "Unauthorized access"}), 403

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute('SELECT * FROM regulations')
    regulations = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(regulations)

# Ruta za ažuriranje regulativa
@app.route('/director/update_regulation/<int:regulation_id>', methods=['PUT'])
@login_required
def director_update_regulation(regulation_id):
    if current_user.role != 'director':
        return jsonify({"error": "Unauthorized access"}), 403

    connection = get_db_connection()
    cursor = connection.cursor()

    title = request.form.get('title')
    file = request.files.get('file')

    cursor.execute('SELECT * FROM regulations WHERE id = %s', (regulation_id,))
    regulation = cursor.fetchone()

    if not regulation:
        cursor.close()
        connection.close()
        return jsonify({'error': 'Regulation not found'}), 404

    cursor.execute('UPDATE regulations SET title = %s WHERE id = %s', (title, regulation_id))

    if file:
        file_name = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], file_name))
        cursor.execute('UPDATE regulations SET file_path = %s WHERE id = %s', (file_name, regulation_id))

    connection.commit()
    cursor.close()
    connection.close()
    return jsonify({'success': 'Regulation updated successfully'})



@app.route('/director/add_user', methods=['POST'])
def director_add_user():
    try:
        data = request.get_json()
        print("Received data:", data)  # Debug line

        # Extracting data with default values
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        email = data.get('email')
        password = data.get('password')
        gender = data.get('gender')
        phone_number = data.get('phone_number')
        country = data.get('country')
        city = data.get('city')
        address = data.get('address')
        postal_code = data.get('postal_code')
        role = data.get('role')

        # Validation
        required_fields = ['first_name', 'last_name', 'email', 'password', 'gender', 'phone_number', 'country', 'city', 'address', 'postal_code', 'role']
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return jsonify({"error": f"Missing fields: {', '.join(missing_fields)}"}), 400

        # Debugging the variables and SQL command
        print(f"Variables: {first_name}, {last_name}, {email}, {gender}, {phone_number}, {country}, {city}, {address}, {postal_code}, {role}")
        
        password_hash = generate_password_hash(password)
        print("Password hash:", password_hash)  # Debug line
        
        connection = get_db_connection()
        if connection is None:
            return jsonify({"error": "Database connection failed"}), 500

        with connection.cursor() as cursor:
            query = """
            INSERT INTO users (first_name, last_name, email, gender, phone_number, country, city, address, postal_code, password_hash, role)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            values = (first_name, last_name, email, gender, phone_number, country, city, address, postal_code, password_hash, role)
            try:
                cursor.execute(query, values)
                connection.commit()
            except Exception as e:
                print("SQL Error:", e)  # Debug line
                return jsonify({"error": "Failed to insert data into database"}), 500

        return jsonify({"message": "User added successfully"}), 201

    except Exception as e:
        print("Exception:", e)  # Debug line
        return jsonify({"error": str(e)}), 500

@app.route('/director/users', methods=['GET'])
def director_get_users():
    try:
        connection = get_db_connection()
        if connection is None:
            return jsonify({"error": "Database connection failed"}), 500

        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT id, first_name, last_name, email, gender, phone_number, country, city, address, postal_code, role FROM users")
        users = cursor.fetchall()
        cursor.close()
        connection.close()
        return jsonify(users), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/director/update_user/<int:user_id>', methods=['PUT'])
def director_update_user(user_id):
    try:
        data = request.get_json()
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        email = data.get('email')
        password = data.get('password')
        gender = data.get('gender')
        phone_number = data.get('phone_number')
        country = data.get('country')
        city = data.get('city')
        address = data.get('address')
        postal_code = data.get('postal_code')
        role = data.get('role')

        # Validation
        required_fields = ['first_name', 'last_name', 'email', 'gender', 'phone_number', 'country', 'city', 'address', 'postal_code', 'role']
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return jsonify({"error": f"Missing fields: {', '.join(missing_fields)}"}), 400

        # Handle optional password
        password_hash = generate_password_hash(password) if password else None

        connection = get_db_connection()
        if connection is None:
            return jsonify({"error": "Database connection failed"}), 500

        with connection.cursor() as cursor:
            query = """
            UPDATE users
            SET first_name = %s, last_name = %s, email = %s, gender = %s, phone_number = %s, country = %s, city = %s, address = %s, postal_code = %s, role = %s
            """
            values = (first_name, last_name, email, gender, phone_number, country, city, address, postal_code, role)
            
            if password_hash:
                query += ", password_hash = %s"
                values += (password_hash,)
            
            query += " WHERE id = %s"
            values += (user_id,)
            
            try:
                cursor.execute(query, values)
                connection.commit()
            except Exception as e:
                print("SQL Error:", e)
                return jsonify({"error": "Failed to update data in the database"}), 500

        return jsonify({"message": "User updated successfully"}), 200

    except Exception as e:
        print("Exception:", e)
        return jsonify({"error": str(e)}), 500


@app.route('/director/add_child', methods=['POST'])
@login_required
def director_add_child():
    if current_user.role != 'director':
        return jsonify({"error": "Unauthorized access"}), 403

    first_name = request.form.get('first_name')
    last_name = request.form.get('last_name')
    date_of_birth = request.form.get('date_of_birth')
    date_of_admission = request.form.get('date_of_admission')
    caregiver_id = request.form.get('caregiver_id')
    jmbg = request.form.get('jmbg')
    place_of_birth = request.form.get('place_of_birth')
    image = request.files.get('image')
    parent_name = request.form.get('parent_name')
    notes = request.form.get('notes')

    if image and allowed_file(image.filename):
        image_filename = secure_filename(image.filename)
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], image_filename)
        image.save(image_path)
    else:
        image_path = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        query = """
        INSERT INTO children (first_name, last_name, date_of_birth, date_of_admission, caregiver_id, jmbg, place_of_birth, image_path, parent_name, notes)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (first_name, last_name, date_of_birth, date_of_admission, caregiver_id, jmbg, place_of_birth, image_path, parent_name, notes)
        cursor.execute(query, values)
        connection.commit()
        cursor.close()
        connection.close()
    except Exception as e:
        app.logger.error("Database error: %s", str(e))
        return jsonify({"error": "Failed to add child"}), 500

    return jsonify({"message": "Child successfully added"}), 201

@app.route('/director/get_children', methods=['GET'])
@login_required
def director_get_children():
    if current_user.role != 'director':
        return jsonify({"error": "Unauthorized access"}), 403

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute('SELECT * FROM children')
    children = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(children)

@app.route('/director/update_child/<int:child_id>', methods=['PUT'])
@login_required
def director_update_child(child_id):
    if current_user.role != 'director':
        return jsonify({"error": "Unauthorized access"}), 403

    first_name = request.form.get('first_name')
    last_name = request.form.get('last_name')
    date_of_birth = request.form.get('date_of_birth')
    date_of_admission = request.form.get('date_of_admission')
    caregiver_id = request.form.get('caregiver_id')
    jmbg = request.form.get('jmbg')
    place_of_birth = request.form.get('place_of_birth')
    image = request.files.get('image')
    parent_name = request.form.get('parent_name')
    notes = request.form.get('notes')

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        query = """
        UPDATE children SET first_name = %s, last_name = %s, date_of_birth = %s, date_of_admission = %s,
                            caregiver_id = %s, jmbg = %s, place_of_birth = %s, parent_name = %s, notes = %s
        WHERE id = %s
        """
        values = (first_name, last_name, date_of_birth, date_of_admission, caregiver_id, jmbg, place_of_birth, parent_name, notes, child_id)
        cursor.execute(query, values)

        if image and allowed_file(image.filename):
            image_filename = secure_filename(image.filename)
            image_path = os.path.join(app.config['UPLOAD_FOLDER'], image_filename)
            image.save(image_path)
            cursor.execute('UPDATE children SET image_path = %s WHERE id = %s', (image_path, child_id))

        connection.commit()
        cursor.close()
        connection.close()
    except Exception as e:
        app.logger.error("Database error: %s", str(e))
        return jsonify({"error": "Failed to update child"}), 500

    return jsonify({'success': 'Child updated successfully'})

@app.route('/director/upload_news', methods=['POST'])
@login_required
def director_upload_news():
    if current_user.role != 'director':
        return jsonify({"error": "Unauthorized access"}), 403

    if 'file' not in request.files:
        app.logger.debug("No file part in the request.")
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    title = request.form.get('title')
    description = request.form.get('description')

    if file.filename == '':
        app.logger.debug("No selected file.")
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        uploaded_by = current_user.id
        app.logger.debug("User ID from session: %s", uploaded_by)

        try:
            connection = get_db_connection()
            cursor = connection.cursor()
            query = """
            INSERT INTO news (title, description, image_path, uploaded_by)
            VALUES (%s, %s, %s, %s)
            """
            values = (title, description, file_path, uploaded_by)
            cursor.execute(query, values)
            connection.commit()
            cursor.close()
            connection.close()
        except Exception as e:
            app.logger.error("Database error: %s", str(e))
            return jsonify({"error": "Failed to save news"}), 500

        return jsonify({"message": "News successfully uploaded"}), 201
    else:
        app.logger.debug("Invalid file format.")
        return jsonify({"error": "Invalid file format"}), 400

@app.route('/director/get_news', methods=['GET'])
@login_required
def director_get_news():
    if current_user.role != 'director':
        return jsonify({"error": "Unauthorized access"}), 403

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute('SELECT * FROM news')
    news_items = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(news_items)

@app.route('/director/update_news/<int:news_id>', methods=['PUT'])
@login_required
def director_update_news(news_id):
    if current_user.role != 'director':
        return jsonify({"error": "Unauthorized access"}), 403

    connection = get_db_connection()
    cursor = connection.cursor()

    title = request.form.get('title')
    description = request.form.get('description')
    file = request.files.get('file')

    cursor.execute('SELECT * FROM news WHERE id = %s', (news_id,))
    news_item = cursor.fetchone()

    if not news_item:
        cursor.close()
        connection.close()
        return jsonify({'error': 'News item not found'}), 404

    cursor.execute('UPDATE news SET title = %s, description = %s WHERE id = %s', (title, description, news_id))

    if file:
        file_name = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file_name)
        file.save(file_path)
        cursor.execute('UPDATE news SET image_path = %s WHERE id = %s', (file_path, news_id))

    connection.commit()
    cursor.close()
    connection.close()
    return jsonify({'success': 'News item updated successfully'})

@app.route('/director/director_create_donation', methods=['POST'])
def director_create_donation():
    data = request.json
    donor_id = data.get('donor_id')
    amount = data.get('amount')

    if not donor_id or not amount or amount <= 0:
        return jsonify(error="Invalid donor_id or amount"), 400

    try:
        # Create Stripe payment intent
        payment_intent = stripe.PaymentIntent.create(
            amount=int(amount * 100),  # Convert to cents
            currency='BAM',
            payment_method_types=['card'],
            description='Donation Payment'
        )
        app.logger.debug(f'Payment Intent Created: {payment_intent}')

        # Insert donation into the database with local time
        connection = get_db_connection()
        cursor = connection.cursor()

        # Get current local time
        now_local = datetime.now()

        sql = """INSERT INTO donations (donor_id, amount, transaction_id, payment_status, donation_date)
                 VALUES (%s, %s, %s, %s, %s)"""
        cursor.execute(sql, (donor_id, amount, payment_intent.id, 'pending', now_local))
        connection.commit()
        cursor.close()
        connection.close()

        return jsonify({'client_secret': payment_intent.client_secret})

    except Exception as e:
        app.logger.error(f'Error occurred: {e}')
        return jsonify(error=str(e)), 403

@app.route('/director/list_donations', methods=['GET'])
def director_list_donations():
    """
    Dohvaća popis donacija za određenog donatora na temelju user_id.
    """
    api_key = request.headers.get('X-API-Key')
    if not api_key:
        app.logger.error('Missing API Key')
        return jsonify({'msg': 'Missing API Key'}), 400

    valid_api_key = generate_api_key('a3c0f2b4e3d3c9a9e4b7a6e7d3a8b9c6')
    if not hmac.compare_digest(api_key, valid_api_key):
        app.logger.warning(f'Invalid API Key. Received: {api_key}, Expected: {valid_api_key}')
        return jsonify({'msg': 'Invalid API Key'}), 403

    user_id = request.args.get('user_id')
    if not user_id:
        app.logger.error('Missing user ID')
        return jsonify({'msg': 'Missing user ID'}), 400

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SET time_zone = 'Europe/Belgrade'")
        
        sql = """SELECT d.id, d.donor_id, d.amount, d.donation_date, d.transaction_id, d.payment_status, u.first_name, u.last_name
                 FROM donations d
                 JOIN users u ON d.donor_id = u.id
                 WHERE d.donor_id = %s"""
        cursor.execute(sql, (user_id,))
        donations = cursor.fetchall()
        cursor.close()
        connection.close()

        local_tz = pytz.timezone('Europe/Belgrade')
        for donation in donations:
            donation['donation_date'] = donation['donation_date'].astimezone(local_tz).strftime('%Y-%m-%d %H:%M:%S')

        return jsonify(donations)

    except Exception as e:
        app.logger.error(f'Error occurred while fetching donations: {e}')
        return jsonify(error=str(e)), 500


        return jsonify(donations)

    except Exception as e:
        app.logger.error(f'Error occurred while fetching donations: {e}')
        return jsonify(error=str(e)), 500  # 500 Internal Server Error for unexpected errors


@app.route('/caregiver/director_create_donation', methods=['POST'])
def caregiver_create_donation():
    data = request.json
    donor_id = data.get('donor_id')
    amount = data.get('amount')

    if not donor_id or not amount or amount <= 0:
        return jsonify(error="Invalid donor_id or amount"), 400

    try:
        # Create Stripe payment intent
        payment_intent = stripe.PaymentIntent.create(
            amount=int(amount * 100),  # Convert to cents
            currency='BAM',
            payment_method_types=['card'],
            description='Donation Payment'
        )
        app.logger.debug(f'Payment Intent Created: {payment_intent}')

        # Insert donation into the database with local time
        connection = get_db_connection()
        cursor = connection.cursor()

        # Get current local time
        now_local = datetime.now()

        sql = """INSERT INTO donations (donor_id, amount, transaction_id, payment_status, donation_date)
                 VALUES (%s, %s, %s, %s, %s)"""
        cursor.execute(sql, (donor_id, amount, payment_intent.id, 'pending', now_local))
        connection.commit()
        cursor.close()
        connection.close()

        return jsonify({'client_secret': payment_intent.client_secret})

    except Exception as e:
        app.logger.error(f'Error occurred: {e}')
        return jsonify(error=str(e)), 403



@app.route('/caregiver/list_donations', methods=['GET'])
def caregiver_list_donations():
    """
    Dohvaća popis donacija za određenog donatora na temelju user_id.
    """
    api_key = request.headers.get('X-API-Key')
    if not api_key:
        app.logger.error('Missing API Key')
        return jsonify({'msg': 'Missing API Key'}), 400

    valid_api_key = generate_api_key('a3c0f2b4e3d3c9a9e4b7a6e7d3a8b9c6')
    if not hmac.compare_digest(api_key, valid_api_key):
        app.logger.warning(f'Invalid API Key. Received: {api_key}, Expected: {valid_api_key}')
        return jsonify({'msg': 'Invalid API Key'}), 403

    user_id = request.args.get('user_id')
    if not user_id:
        app.logger.error('Missing user ID')
        return jsonify({'msg': 'Missing user ID'}), 400

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SET time_zone = 'Europe/Belgrade'")
        
        sql = """SELECT d.id, d.donor_id, d.amount, d.donation_date, d.transaction_id, d.payment_status, u.first_name, u.last_name
                 FROM donations d
                 JOIN users u ON d.donor_id = u.id
                 WHERE d.donor_id = %s"""
        cursor.execute(sql, (user_id,))
        donations = cursor.fetchall()
        cursor.close()
        connection.close()

        local_tz = pytz.timezone('Europe/Belgrade')
        for donation in donations:
            donation['donation_date'] = donation['donation_date'].astimezone(local_tz).strftime('%Y-%m-%d %H:%M:%S')

        return jsonify(donations)

    except Exception as e:
        app.logger.error(f'Error occurred while fetching donations: {e}')
        return jsonify(error=str(e)), 500

@app.route('/donor/donor_create_donation', methods=['POST'])  # Definiše rutu za kreiranje donacije putem POST metode.
def donor_create_donation():
    data = request.json  # Prima JSON podatke iz zahtjeva (request) koji sadrže informacije o donaciji.
    donor_id = data.get('donor_id')
    amount = data.get('amount') # Izvlači 'donor_id' i 'amount' iz JSON podataka.
   # Pokušava da kreira PaymentIntent koristeći Stripe API.
    if not donor_id or not amount or amount <= 0:  # Stripe očekuje iznos u najnižim jedinicama valute (centima). Pretvara iznos u feninge (ako je BAM valuta).
        return jsonify(error="Invalid donor_id or amount"), 400

    try:
        
        payment_intent = stripe.PaymentIntent.create(
            amount=int(amount * 100),  
            currency='BAM', # Postavlja valutu na 'BAM' (Bosanska konvertibilna marka).
            payment_method_types=['card'],  # Dopušta samo metode plaćanja karticama.
            description='Donation Payment'  # Postavlja opis transakcije kao "Donation Payment".
        )
        app.logger.debug(f'Payment Intent Created: {payment_intent}')  # Logira kreirani PaymentIntent u debug log.

   
        connection = get_db_connection()
        cursor = connection.cursor() # Povezuje se na bazu podataka i kreira cursor za izvršavanje SQL upita.

  
        now_local = datetime.now()  # Dobija trenutno lokalno vrijeme za evidentiranje datuma donacije.
         # SQL upit za umetanje nove donacije u tabelu `donations`.
        sql = """INSERT INTO donations (donor_id, amount, transaction_id, payment_status, donation_date)
                 VALUES (%s, %s, %s, %s, %s)"""
        cursor.execute(sql, (donor_id, amount, payment_intent.id, 'pending', now_local))
        connection.commit()   # Potvrđuje promjene u bazi podataka.
        cursor.close()
        connection.close()

        return jsonify({'client_secret': payment_intent.client_secret}) # Vraća JSON odgovor koji sadrži 'client_secret' iz Stripe PaymentIntent-a.

    except Exception as e:
        app.logger.error(f'Error occurred: {e}') # Ako dođe do greške bilo tokom kreiranja Stripe PaymentIntent-a ili interakcije s bazom.
        return jsonify(error=str(e)), 403  # Vraća odgovor sa greškom i HTTP status kodom 403.



@app.route('/donor/list_donations', methods=['GET'])
def donor_list_donations():  # Definiše rutu za GET metodu koja vraća listu donacija za određenog donatora na osnovu njegovog 'user_id'.
    """
    Dohvaća popis donacija za određenog donatora na temelju user_id.
    """
    api_key = request.headers.get('X-API-Key') # Dohvaća API ključ iz zaglavlja zahteva. Ovaj ključ je potreban za autentifikaciju.
    if not api_key:
        app.logger.error('Missing API Key')
        return jsonify({'msg': 'Missing API Key'}), 400 # Ako API ključ nije prisutan u zaglavlju, logira grešku i vraća HTTP status kod 400 s porukom "Missing API Key".

    valid_api_key = generate_api_key('a3c0f2b4e3d3c9a9e4b7a6e7d3a8b9c6') # Generiše validan API ključ koristeći funkciju `generate_api_key` sa zadatim inputom.
    if not hmac.compare_digest(api_key, valid_api_key):
        app.logger.warning(f'Invalid API Key. Received: {api_key}, Expected: {valid_api_key}')
        return jsonify({'msg': 'Invalid API Key'}), 403 # Ako se primljeni API ključ ne podudara sa validnim API ključem, vraća HTTP status kod 403 i logira poruku o nevažećem API ključu.


    user_id = request.args.get('user_id')  # Izvlači 'user_id' iz query parametara zahtjeva.
    if not user_id:
        app.logger.error('Missing user ID')
        return jsonify({'msg': 'Missing user ID'}), 400 # Ako 'user_id' nije prisutan, logira grešku i vraća HTTP status kod 400 s porukom "Missing user ID".


    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SET time_zone = 'Europe/Belgrade'") # Postavlja vremensku zonu baze podataka na "Europe/Belgrade" kako bi se datumi i vremena pravilno formatirali.
         # SQL upit koji dohvaća podatke o donacijama.
        sql = """SELECT d.id, d.donor_id, d.amount, d.donation_date, d.transaction_id, d.payment_status, u.first_name, u.last_name
                 FROM donations d
                 JOIN users u ON d.donor_id = u.id
                 WHERE d.donor_id = %s"""
        cursor.execute(sql, (user_id,)) # Izvršava SQL upit sa prosljeđenim 'user_id' kao argumentom.
        donations = cursor.fetchall()     # Dohvaća sve rezultate upita i sprema ih u promenljivu `donations`.
        cursor.close()
        connection.close() # Zatvara cursor i konekciju sa bazom podataka.

        local_tz = pytz.timezone('Europe/Belgrade') # Definiše lokalnu vremensku zonu koristeći 'pytz' biblioteku.
        for donation in donations:
            # Prolazi kroz sve donacije i konvertuje 'donation_date' u lokalnu vremensku zonu i formatira datum u odgovarajući format.
            donation['donation_date'] = donation['donation_date'].astimezone(local_tz).strftime('%Y-%m-%d %H:%M:%S')

        return jsonify(donations)  # Vraća donacije u JSON formatu kao odgovor klijentu.

    except Exception as e:
        app.logger.error(f'Error occurred while fetching donations: {e}') # Ako dođe do greške tokom izvršavanja upita ili komunikacije sa bazom, logira grešku.
        return jsonify(error=str(e)), 500  # Vraća HTTP status kod 500 sa porukom greške.




@app.route('/donor/list3_donations', methods=['GET'])
def donor3_list_donations(): # Definiše rutu za GET metodu koja vraća tri najveće donacije određenog donatora na osnovu 'user_id'.
    """
    Dohvaća popis donacija za određenog donatora na temelju user_id i ispisuje 3 najveća iznosa.
    """
    api_key = request.headers.get('X-API-Key')  # Dohvaća API ključ iz zaglavlja zahtjeva. Ovaj ključ je potreban za autentifikaciju.
    if not api_key:
        app.logger.error('Missing API Key')
        return jsonify({'msg': 'Missing API Key'}), 400  # Ako API ključ nije prisutan u zaglavlju, logira grešku i vraća HTTP status kod 400 sa porukom "Missing API Key".

    valid_api_key = generate_api_key('a3c0f2b4e3d3c9a9e4b7a6e7d3a8b9c6') # Generiše validan API ključ koristeći funkciju `generate_api_key` sa zadatim inputom.
    if not hmac.compare_digest(api_key, valid_api_key):
        app.logger.warning(f'Invalid API Key. Received: {api_key}, Expected: {valid_api_key}')
        return jsonify({'msg': 'Invalid API Key'}), 403 # Ako se primljeni API ključ ne podudara sa validnim API ključem, vraća HTTP status kod 403 i logira poruku o nevažećem API ključu.


    user_id = request.args.get('user_id')  # Izvlači 'user_id' iz query parametara zahtjeva.
    if not user_id:
        app.logger.error('Missing user ID')
        return jsonify({'msg': 'Missing user ID'}), 400

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True) # Povezuje se na bazu podataka i kreira cursor sa `dictionary=True`.
        cursor.execute("SET time_zone = 'Europe/Belgrade'")     # Postavlja vremensku zonu baze podataka na "Europe/Belgrade" kako bi se datumi i vremena pravilno formatirali.
        
        # SQL upit za dohvaćanje 3 najveća iznosa donacija za određenog donatora
        sql = """
        SELECT d.id, d.donor_id, d.amount, d.donation_date, d.transaction_id, d.payment_status, u.first_name, u.last_name
        FROM donations d
        JOIN users u ON d.donor_id = u.id
        WHERE d.donor_id = %s
        ORDER BY d.amount DESC
        LIMIT 3
        """
        cursor.execute(sql, (user_id,))
        donations = cursor.fetchall()
        cursor.close()
        connection.close() # Zatvara cursor i konekciju sa bazom podataka.

        # Konvertovanje vremenske zone
        local_tz = pytz.timezone('Europe/Belgrade')
        for donation in donations:
            donation['donation_date'] = donation['donation_date'].astimezone(local_tz).strftime('%Y-%m-%d %H:%M:%S')

        return jsonify(donations)  # Vraća donacije u JSON formatu kao odgovor klijentu.

    except Exception as e:
        app.logger.error(f'Error occurred while fetching donations: {e}')
        return jsonify(error=str(e)), 500 # Vraća HTTP status kod 500 sa porukom greške.

@app.route('/donor/list_failed_donations', methods=['GET'])
def donor_list_failed_donations():
    """
    Dohvaća popis neuspjelih donacija za određenog donatora na temelju user_id.
    """
    api_key = request.headers.get('X-API-Key') # Dohvaća API ključ iz zaglavlja zahtjeva. Ovaj ključ je potreban za autentifikaciju korisnika.
    if not api_key:
        app.logger.error('Missing API Key')
        return jsonify({'msg': 'Missing API Key'}), 400     # Ako API ključ nije prisutan, logira grešku i vraća HTTP status 400 sa porukom "Missing API Key".

    valid_api_key = generate_api_key('a3c0f2b4e3d3c9a9e4b7a6e7d3a8b9c6')     # Generiše validan API ključ pomoću funkcije `generate_api_key` koristeći zadani ulaz.
    if not hmac.compare_digest(api_key, valid_api_key):
        app.logger.warning(f'Invalid API Key. Received: {api_key}, Expected: {valid_api_key}')
        return jsonify({'msg': 'Invalid API Key'}), 403  # Ako se uneseni API ključ ne poklapa sa generiranim, logira grešku i vraća HTTP status 403 sa porukom "Invalid API Key".

    user_id = request.args.get('user_id')   # Dohvaća 'user_id' iz query parametara zahtjeva.
    if not user_id:
        app.logger.error('Missing user ID')
        return jsonify({'msg': 'Missing user ID'}), 400

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SET time_zone = 'Europe/Belgrade'") # Postavlja vremensku zonu baze na "Europe/Belgrade" kako bi se svi datumi i vremena pravilno formatirali.
        
        # SQL upit za dohvaćanje neuspjelih donacija
        sql = """
        SELECT d.id, d.donor_id, d.amount, d.donation_date, d.transaction_id, d.payment_status, u.first_name, u.last_name
        FROM donations d
        JOIN users u ON d.donor_id = u.id
        WHERE d.donor_id = %s AND d.payment_status = 'failed'
        """
        cursor.execute(sql, (user_id,))
        donations = cursor.fetchall()    # Dohvaća sve rezultate upita i sprema ih u promenljivu `donations`.
        cursor.close()
        connection.close()

        # Konvertovanje vremenske zone
        local_tz = pytz.timezone('Europe/Belgrade')   # Definiše lokalnu vremensku zonu koristeći biblioteku 'pytz'.
        for donation in donations:
            donation['donation_date'] = donation['donation_date'].astimezone(local_tz).strftime('%Y-%m-%d %H:%M:%S')

        return jsonify(donations)   # Vraća listu donacija u JSON formatu kao odgovor.

    except Exception as e:
        app.logger.error(f'Error occurred while fetching donations: {e}') # Ako dođe do greške tijekom izvođenja koda ili rada s bazom, logira grešku.
        return jsonify(error=str(e)), 500  # Vraća HTTP status kod 500 sa porukom greške u JSON formatu.

@app.route('/donor/total_donations', methods=['GET'])  
def donor_total_donations():
    """
    Dohvaća ukupni iznos donacija za određenog donatora na temelju user_id.
    """
    api_key = request.headers.get('X-API-Key')  # Dohvaća API ključ iz zaglavlja zahtjeva. Ovaj ključ je potreban za autentifikaciju korisnika.
    if not api_key:
        app.logger.error('Missing API Key')
        return jsonify({'msg': 'Missing API Key'}), 400 # Ako API ključ nije prisutan, logira grešku i vraća HTTP status 400 sa porukom "Missing API Key".

    valid_api_key = generate_api_key('a3c0f2b4e3d3c9a9e4b7a6e7d3a8b9c6')     # Generiše validan API ključ pomoću funkcije `generate_api_key` koristeći zadani ulaz.
    if not hmac.compare_digest(api_key, valid_api_key):
        app.logger.warning(f'Invalid API Key. Received: {api_key}, Expected: {valid_api_key}')
        return jsonify({'msg': 'Invalid API Key'}), 403  # Ako se uneseni API ključ ne poklapa sa generiranim, logira grešku i vraća HTTP status 403 sa porukom "Invalid API Key".

    user_id = request.args.get('user_id')
    if not user_id:
        app.logger.error('Missing user ID')
        return jsonify({'msg': 'Missing user ID'}), 400   # Ako 'user_id' nije prisutan, logira grešku i vraća HTTP status 400 sa porukom "Missing user ID".

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SET time_zone = 'Europe/Belgrade'")      # Postavlja vremensku zonu baze na "Europe/Belgrade" kako bi se svi datumi i vremena pravilno formatirali.

        # SQL upit za dohvaćanje ukupnog iznosa donacija
        sql = """
        SELECT COALESCE(SUM(d.amount), 0) AS total_amount
        FROM donations d
        WHERE d.donor_id = %s
        """
        cursor.execute(sql, (user_id,))
        result = cursor.fetchone()
        cursor.close()
        connection.close()

        return jsonify({'total_amount': result['total_amount']})   # Vraća ukupan iznos donacija u JSON formatu kao odgovor.

    except Exception as e:
        app.logger.error(f'Error occurred while fetching total donations: {e}')
        return jsonify(error=str(e)), 500 # Vraća HTTP status kod 500 sa porukom greške u JSON formatu.


@app.route('/donor/update_profile', methods=['PUT'])
def donor_update_user(): # Definiše rutu koja omogućava ažuriranje profila donatora putem HTTP PUT zahtjeva.
    data = request.get_json() # Preuzima JSON podatke iz tijela zahtjeva.
    user_id = data.get('user_id')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email')
    phone_number = data.get('phone_number')
    country = data.get('country')
    city = data.get('city')
    address = data.get('address')
    postal_code = data.get('postal_code')
    password = data.get('password')  

    if not user_id:
        return jsonify({"message": "User ID is required"}), 400  # Provjerava da li je `user_id` prisutan. Ako nije, vraća HTTP status 400 sa porukom "User ID is required".

    try:
        connection = get_db_connection()
        cursor = connection.cursor() # Povezuje se na bazu podataka i kreira cursor za izvršavanje SQL upita

        if password:  # Ako je lozinka prisutna u podacima, hashira je i dodaje u SQL upit.
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')  # Hashira lozinku pomoću bcrypt algoritma i generiše salt. Rezultat dekodira iz bajtova u string.
            query = """
            UPDATE users
            SET first_name = %s,
                last_name = %s,
                email = %s,
                phone_number = %s,
                country = %s,
                city = %s,
                address = %s,
                postal_code = %s,
                password_hash = %s
            WHERE id = %s
            """
            cursor.execute(query, (first_name, last_name, email, phone_number, country, city, address, postal_code, hashed_password, user_id))
        else:  
            query = """
            UPDATE users
            SET first_name = %s,
                last_name = %s,
                email = %s,
                phone_number = %s,
                country = %s,
                city = %s,
                address = %s,
                postal_code = %s
            WHERE id = %s
            """
            cursor.execute(query, (first_name, last_name, email, phone_number, country, city, address, postal_code, user_id))

        connection.commit()
        cursor.close()
        connection.close() # Zatvara cursor i konekciju s bazom podataka.

        return jsonify({"message": "User data updated successfully"}), 200

    except Exception as e:
        app.logger.error(f"Error updating user data: {e}")
        return jsonify({"message": "An error occurred while updating user data."}), 500 # Vraća HTTP status 500 sa porukom o grešci ako se dogodi izuzetak.




@app.route('/donor/profile', methods=['GET'])
def get_donor_profile():
    """
    Dohvaća profil trenutnog korisnika na temelju user_id.
    """
    api_key = request.headers.get('X-API-Key')     # Iz zaglavlja zahtjeva preuzima API ključ (X-API-Key).
    if not api_key:
        app.logger.error('Missing API Key')
        return jsonify({'msg': 'Missing API Key'}), 400  # Ako API ključ nije poslan, logira grešku.

    valid_api_key = generate_api_key('a3c0f2b4e3d3c9a9e4b7a6e7d3a8b9c6') # Generiše validan API ključ pomoću funkcije `generate_api_key`.
    if not hmac.compare_digest(api_key, valid_api_key):
        app.logger.warning(f'Invalid API Key. Received: {api_key}, Expected: {valid_api_key}')
        return jsonify({'msg': 'Invalid API Key'}), 403  # Vraća HTTP status 403 (Forbidden) sa porukom "Invalid API Key"

    user_id = request.args.get('user_id')
    if not user_id:
        app.logger.error('Missing user ID')
        return jsonify({'msg': 'Missing user ID'}), 400  # Vraća HTTP status 400 (Bad Request) sa porukom "Missing user ID".

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SET time_zone = 'Europe/Belgrade'")   # Podešava vremensku zonu na 'Europe/Belgrade' za rad s datumima i vremenima.
        
        sql = """SELECT id, first_name, last_name, email, gender, phone_number, country, city, address, postal_code, role, created_at
                 FROM users
                 WHERE id = %s"""
        cursor.execute(sql, (user_id,))
        user_profile = cursor.fetchone()
        cursor.close()
        connection.close()  # Zatvara kursor i konekciju s bazom podataka.

        if not user_profile:
            return jsonify({'msg': 'User not found'}), 404

        # Convert the `created_at` field to the local time zone
        local_tz = pytz.timezone('Europe/Belgrade')  # Definiše lokalnu vremensku zonu 'Europe/Belgrade'.
        user_profile['created_at'] = user_profile['created_at'].astimezone(local_tz).strftime('%Y-%m-%d %H:%M:%S')   # Pretvara `created_at` iz baze podataka u lokalnu vremensku zonu i formatira datum u string 'YYYY-MM-DD HH:MM:SS'.

        return jsonify(user_profile)  # Vraća korisnički profil u formatu JSON kao odgovor na zahtjev.

    except Exception as e:
        app.logger.error(f'Error occurred while fetching user profile: {e}')
        return jsonify(error=str(e)), 500   # Vraća HTTP status 500 (Internal Server Error) s porukom greške.


@app.route('/guest/guest_get_news', methods=['GET'])
def guest_get_news():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    
    # Dodaj ORDER BY za sortiranje vijesti prema datumu od najnovijeg do najstarijeg
    cursor.execute('SELECT * FROM news ORDER BY upload_date DESC')
    
    news_items = cursor.fetchall()
    cursor.close()
    connection.close()
    
    return jsonify(news_items)




@app.route('/guest/guest_get_procurements', methods=['GET'])
def guest_get_procurements():
    try:
        # Konekcija sa bazom podataka
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)

        # Izvršenje SQL upita
        cursor.execute('SELECT id, title, file_path FROM public_procurements')
        procurements = cursor.fetchall()

        # Zatvorite konekciju
        cursor.close()
        connection.close()

        return jsonify(procurements)

    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({'error': 'Database error occurred'}), 500

@app.route('/guest/guest_get_reports', methods=['GET'])
def guest_get_reports():
    try:
        # Konekcija sa bazom podataka
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)

        # Izvršenje SQL upita
        cursor.execute('SELECT id, title, file_path FROM reports')
        procurements = cursor.fetchall()

        # Zatvorite konekciju
        cursor.close()
        connection.close()

        return jsonify(procurements)

    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({'error': 'Database error occurred'}), 500
    
@app.route('/guest/guest_get_regulations', methods=['GET'])
def guest_get_regulations():
    try:
        # Konekcija sa bazom podataka
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)

        # Izvršenje SQL upita
        cursor.execute('SELECT id, title, file_path FROM regulations')
        procurements = cursor.fetchall()

        # Zatvorite konekciju
        cursor.close()
        connection.close()

        return jsonify(procurements)

    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({'error': 'Database error occurred'}), 500
    
@app.route('/guest/guest_get_agreements', methods=['GET'])
def guest_get_agreements():
    try:
        # Konekcija sa bazom podataka
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)

        # Izvršenje SQL upita
        cursor.execute('SELECT id, title, file_path FROM agreements')
        procurements = cursor.fetchall()

        # Zatvorite konekciju
        cursor.close()
        connection.close()

        return jsonify(procurements)

    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({'error': 'Database error occurred'}), 500



@app.route('/webhook', methods=['POST'])  # Definiše rutu za webhook koja prihvata POST zahtjeve
def webhook():
    payload = request.get_data(as_text=True)   # Preuzima cijeli sadržaj zahtjeva kao tekstualni payload
    sig_header = request.headers.get('Stripe-Signature') # Uzimanje Stripe potpisa iz zaglavlja zahtjeva

  
    app.logger.info(f'All headers: {request.headers}')  # Logira sve zaglavlja zahtjeva
    app.logger.info(f'Received webhook payload: {payload}')  # Logira sadržaj payloada
    app.logger.info(f'Received webhook signature: {sig_header}')   # Logira Stripe potpis

    try:
        event = stripe.Webhook.construct_event( # Pokušava da konstruira Stripe događaj koristeći payload, potpis i tajni ključ (endpoint_secret)
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        # Ako dođe do greške zbog nevalidnog payloada
        app.logger.error(f'Invalid payload: {e}')
        return jsonify({'success': False, 'error': 'Invalid payload'}), 400
     # Logira grešku i vraća odgovor sa statusom 400 (neispravan zahtjev)
    except stripe.error.SignatureVerificationError as e:
      
        app.logger.error(f'Invalid signature: {e}')  # Ako dođe do greške zbog nevalidnog potpisa
        return jsonify({'success': False, 'error': 'Invalid signature'}), 400   # Logira grešku i vraća odgovor sa statusom 400 (neispravan zahtjev)

   
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        app.logger.info(f'Payment succeeded: {payment_intent["id"]}')
        handle_payment_intent_succeeded(payment_intent)
       # Ako je događaj 'payment_intent.succeeded', logira ID uspješnog plaćanja i obrađuje ga
   
    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        app.logger.info(f'Payment failed: {payment_intent["id"]}')
        handle_payment_intent_failed(payment_intent)
     # Ako je događaj 'payment_intent.payment_failed', logira ID neuspješnog plaćanja i obrađuje ga
 
          # Poziva funkciju za obrada neuspješnog plaćanja
          # Ako je događaj 'charge.succeeded', logira ID uspješne naplate i obrađuje je
    elif event['type'] == 'charge.succeeded':
        charge = event['data']['object']
        app.logger.info(f'Charge succeeded: {charge["id"]}')
        handle_charge_succeeded(charge)

           # Ako je događaj 'charge.updated', logira ID ažurirane naplate i obrađuje je
    elif event['type'] == 'charge.updated':
        charge = event['data']['object']
        app.logger.info(f'Charge updated: {charge["id"]}')
        handle_charge_updated(charge)  # Poziva funkciju za obrada uspješne naplate
       

    return jsonify({'success': True}), 200 # Vraća odgovor sa statusom 200 (OK) i potvrdom da je webhook uspješno obrađen


def handle_payment_intent_succeeded(payment_intent):
    """Handles successful payment intents"""
    app.logger.info(f'Handling successful payment intent: {payment_intent["id"]}')
    try:
        update_payment_status(payment_intent['id'], 'completed')
    except Exception as e:
        app.logger.error(f'Error in handle_payment_intent_succeeded: {e}')



def update_payment_status(transaction_id, status):
    """Helper function to update payment status in the database"""
    connection = None # Inicijalizuje varijable za konekciju i cursor
    cursor = None
    try:
        connection = get_db_connection()    # Povezuje se na bazu podataka koristeći funkciju `get_db_connection()`
        cursor = connection.cursor() # Stvara cursor za izvršavanje SQL upita
        # Definiše SQL upit za ažuriranje statusa plaćanja u tabeli `donations'
        sql = """UPDATE donations 
                 SET payment_status = %s
                 WHERE transaction_id = %s"""
        cursor.execute(sql, (status, transaction_id))  # Izvršava SQL upit sa prosljeđenim statusom i ID-jem transakcije
        connection.commit() # Potvrđuje promjene u bazi podataka
        app.logger.info(f'Donation status updated to {status} for transaction_id {transaction_id}') # Definiše uspješno ažuriranje statusa donacije
    except Exception as e:
        app.logger.error(f'Error updating donation status: {e}') # Ako dođe do greške prilikom ažuriranja, detektuje grešku
    finally:
        if cursor:
            cursor.close()  # Zatvara cursor ako je otvoren
        if connection:
            connection.close()   # Zatvara konekciju ako je otvorena




def handle_charge_succeeded(charge):  # Ažurira status plaćanja na 'completed' za uspješno obrađenu naplatu koristeći ID naplate
    """Handles successful charges"""
    update_payment_status(charge['id'], 'completed')

def handle_charge_updated(charge):  # Definiše detalje ažurirane naplate
    """Handles updated charges"""
    app.logger.info(f'Charge updated details: {charge}')

def handle_payment_intent_failed(payment_intent):    # Postavlja poruku da se obrađuje neuspješan payment intent sa ID-jem iz objekta
    """Handles failed payment intents"""
    app.logger.info(f'Handling failed payment intent: {payment_intent["id"]}')
    try:
        # Pokušava da ažurira status plaćanja u bazi podataka na 'failed'
        update_payment_status(payment_intent['id'], 'failed')
    except Exception as e:
        app.logger.error(f'Error in handle_payment_intent_failed: {e}') # Ako dođe do greške, detektuje grešku

@app.route('/caregiver/add_child', methods=['POST'])
@login_required
def caregiver_add_child():
    if current_user.role != 'caregiver':
        return jsonify({"error": "Unauthorized access"}), 403

    first_name = request.form.get('first_name')
    last_name = request.form.get('last_name')
    date_of_birth = request.form.get('date_of_birth')
    date_of_admission = request.form.get('date_of_admission')
    caregiver_id = current_user.id  # Koristi ID trenutno prijavljenog korisnika
    jmbg = request.form.get('jmbg')
    place_of_birth = request.form.get('place_of_birth')
    image = request.files.get('image')
    parent_name = request.form.get('parent_name')
    notes = request.form.get('notes')

    if image and allowed_file(image.filename):
        image_filename = secure_filename(image.filename)
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], image_filename)
        image.save(image_path)
    else:
        image_path = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        query = """
        INSERT INTO children (first_name, last_name, date_of_birth, date_of_admission, caregiver_id, jmbg, place_of_birth, image_path, parent_name, notes)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (first_name, last_name, date_of_birth, date_of_admission, caregiver_id, jmbg, place_of_birth, image_path, parent_name, notes)
        cursor.execute(query, values)
        connection.commit()
        cursor.close()
        connection.close()
    except Exception as e:
        app.logger.error("Database error: %s", str(e))
        return jsonify({"error": "Failed to add child"}), 500

    return jsonify({"message": "Child successfully added"}), 201

@app.route('/caregiver/get_children', methods=['GET'])
@login_required
def caregiver_get_children():
    if current_user.role != 'caregiver':
        return jsonify({"error": "Unauthorized access"}), 403

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute('SELECT * FROM children')
    children = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(children)



    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        query = """
        UPDATE children SET first_name = %s, last_name = %s, date_of_birth = %s, date_of_admission = %s,
                            caregiver_id = %s, jmbg = %s, place_of_birth = %s, parent_name = %s, notes = %s
        WHERE id = %s
        """
        values = (first_name, last_name, date_of_birth, date_of_admission, caregiver_id, jmbg, place_of_birth, parent_name, notes, child_id)
        cursor.execute(query, values)

        if image and allowed_file(image.filename):
            image_filename = secure_filename(image.filename)
            image_path = os.path.join(app.config['UPLOAD_FOLDER'], image_filename)
            image.save(image_path)
            cursor.execute('UPDATE children SET image_path = %s WHERE id = %s', (image_path, child_id))

        connection.commit()
        cursor.close()
        connection.close()
    except Exception as e:
        app.logger.error("Database error: %s", str(e))
        return jsonify({"error": "Failed to update child"}), 500

    return jsonify({'success': 'Child updated successfully'})

@app.route('/caregiver/search_get_children', methods=['GET'])
@login_required
def search_get_children():
    if current_user.role != 'caregiver':
        return jsonify({"error": "Unauthorized access"}), 403

    first_name = request.args.get('first_name', '')
    last_name = request.args.get('last_name', '')
    jmbg = request.args.get('jmbg', '')

    query = "SELECT * FROM children WHERE 1=1"
    query_params = []

    if first_name:
        query += " AND first_name LIKE %s"
        query_params.append(f"%{first_name}%")
    if last_name:
        query += " AND last_name LIKE %s"
        query_params.append(f"%{last_name}%")
    if jmbg:
        query += " AND jmbg = %s"
        query_params.append(jmbg)

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute(query, query_params)
    children = cursor.fetchall()
    cursor.close()
    connection.close()

    return jsonify(children)

@app.route('/caregiver/update_child/<int:child_id>', methods=['PUT'])
@login_required
def caregiver_update_child(child_id):
    if current_user.role != 'caregiver':
        return jsonify({"error": "Unauthorized access"}), 403

    try:
        # Get the form data from the request
        first_name = request.form.get('first_name')
        last_name = request.form.get('last_name')
        date_of_birth = request.form.get('date_of_birth')
        date_of_admission = request.form.get('date_of_admission')
        jmbg = request.form.get('jmbg')
        place_of_birth = request.form.get('place_of_birth')
        parent_name = request.form.get('parent_name')
        notes = request.form.get('notes')
        image = request.files.get('image')

        # Validate data
        if not first_name or not last_name:
            return jsonify({"error": "First and last names are required"}), 400

        # Database connection
        connection = get_db_connection()
        cursor = connection.cursor()

        # Update child information in the database
        query = """
        UPDATE children
        SET first_name = %s, last_name = %s, date_of_birth = %s, date_of_admission = %s, jmbg = %s,
            place_of_birth = %s, parent_name = %s, notes = %s
        WHERE id = %s
        """
        values = (first_name, last_name, date_of_birth, date_of_admission, jmbg, place_of_birth, parent_name, notes, child_id)
        cursor.execute(query, values)

        # Handle image upload if present
        if image and allowed_file(image.filename):
            image_filename = secure_filename(image.filename)
            image_path = os.path.join(app.config['UPLOAD_FOLDER'], image_filename)
            image.save(image_path)
            cursor.execute('UPDATE children SET image_path = %s WHERE id = %s', (image_path, child_id))

        connection.commit()
        cursor.close()
        connection.close()

        return jsonify({"success": "Child updated successfully"})
    except Exception as e:
        app.logger.error("Database error: %s", str(e))
        return jsonify({"error": "Failed to update child"}), 500


@app.route('/get_user_id', methods=['GET'])
def get_user_id():
    first_name = request.args.get('first_name')
    last_name = request.args.get('last_name')
    
    if not all([first_name, last_name]):
        return jsonify({"error": "Missing data"}), 400

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    
    query = """
        SELECT id FROM users WHERE first_name = %s AND last_name = %s
    """
    cursor.execute(query, (first_name, last_name))
    user = cursor.fetchone()
    connection.close()
    
    if user:
        return jsonify({"id": user['id']}), 200
    else:
        return jsonify({"error": "User not found"}), 404

@app.route('/get_messages', methods=['GET'])  # Definisanje rute '/get_messages' koja prihvata GET zahtjeve
def get_messages():  # Funkcija koja se poziva kada se zahtjeva ruta
    sender_id = request.args.get('sender_id')  # Uzimanje 'sender_id' iz query parametara zahtjeva
    receiver_id = request.args.get('receiver_id')  # Uzimanje 'receiver_id' iz query parametara zahtjeva

    # Provera da li su oba ID-a prisutna
    if not all([sender_id, receiver_id]):  
        return jsonify({"error": "Missing data"}), 400  # Vraćanje greške ako neki od ID-a nedostaje

    connection = get_db_connection()  # Otvaranje veze sa bazom podataka
    cursor = connection.cursor(dictionary=True)  # Kreiranje kursora za izvršavanje SQL upita

    # SQL upit za dobijanje poruka između pošiljaoca i primaoca
    query = """
        SELECT * FROM messages
        WHERE (sender_id = %s AND receiver_id = %s) OR (sender_id = %s AND receiver_id = %s)
        ORDER BY sent_at ASC
    """
    # Izvršavanje SQL upita sa odgovarajućim ID-ovima
    cursor.execute(query, (sender_id, receiver_id, receiver_id, sender_id))  
    messages = cursor.fetchall()  # Uzimanje svih poruka iz rezultata upita
    connection.close()  # Zatvaranje veze sa bazom podataka

    return jsonify(messages), 200  # Vraćanje poruka kao JSON i status 200 (OK)


@app.route('/send_message', methods=['POST'])
def send_message():
    data = request.get_json()
    print(data)  

    # Provjera da li su svi potrebni podaci prisutni
    if not all([data.get('sender_id'), data.get('receiver_id'), data.get('message_text')]):
        return jsonify({"error": "Missing data"}), 400

    # Izvlačenje podataka iz requesta
    sender_id = data['sender_id']
    receiver_id = data['receiver_id']
    message = data['message_text']

    # Spajanje na bazu podataka
    connection = get_db_connection()
    cursor = connection.cursor()

    # SQL upit za umetanje poruke u tablicu 'messages'
    query = """
        INSERT INTO messages (sender_id, receiver_id, message_text, sent_at)
        VALUES (%s, %s, %s, NOW())
    """
    try:
        # Izvršavanje SQL upita
        cursor.execute(query, (sender_id, receiver_id, message))
        connection.commit()  # Potvrđivanje promjena u bazi
    except Exception as e:
        connection.rollback()  # U slučaju greške poništi promjene
        print(f"Error inserting message: {e}")
        return jsonify({"error": "Failed to send message"}), 500
    finally:
        connection.close()  # Zatvaranje konekcije

    return jsonify({"status": "Message sent successfully"}), 200



def get_db_connection():
    conn = mysql.connector.connect(**db_config)
    return conn

@app.route('/api/recent-chats/<int:user_id>', methods=['GET'])  # Definisanje rute '/api/recent-chats/<user_id>' koja prihvata GET zahtjeve
def get_recent_chats(user_id):  # Funkcija koja se poziva kada se zahtjeva ruta, prima ID korisnika kao argument
    conn = get_db_connection()  # Otvaranje veze sa bazom podataka
    cursor = conn.cursor(dictionary=True)  # Kreiranje kursora za izvršavanje SQL upita

    # SQL upit za dobijanje nedavnih chatova za određenog korisnika
    query = """
    SELECT u.id, u.first_name, u.last_name, c.last_message, c.last_message_time, c.unread_count
    FROM users u
    JOIN chat_messages c ON u.id = c.sender_id OR u.id = c.receiver_id  # Spajanje tabela korisnika i chat poruka
    WHERE c.sender_id = %s OR c.receiver_id = %s  # Filtriranje poruka koje su poslali ili primili korisnik
    GROUP BY u.id  # Grupisanje rezultata prema ID-u korisnika
    ORDER BY c.last_message_time DESC  # Sortiranje rezultata prema vremenu poslednje poruke u opadajućem redosledu
    """
    cursor.execute(query, (user_id, user_id))  # Izvršavanje SQL upita sa ID-em korisnika
    recent_chats = cursor.fetchall()  # Uzimanje svih nedavnih chatova iz rezultata upita
    cursor.close()  # Zatvaranje kursora
    conn.close()  # Zatvaranje veze sa bazom podataka

    return jsonify(recent_chats)  # Vraćanje nedavnih chatova kao JSON


@app.route('/api/donations/<int:year>/<int:month>', methods=['GET'])
def get_donations_by_day(year, month):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    
    start_date = datetime(year, month, 1)
    end_date = (start_date + timedelta(days=31)).replace(day=1)  # Početak sljedećeg mjeseca

    query = """
        SELECT DATE(donation_date) AS day, SUM(amount) AS total_amount
        FROM donations
        WHERE donation_date >= %s AND donation_date < %s
        GROUP BY DATE(donation_date)
        ORDER BY day
    """
    cursor.execute(query, (start_date, end_date))
    results = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(results)

@app.route('/caregiver/get_children_ID', methods=['GET'])
@login_required
def caregiver_get_children_ID():
    if current_user.role != 'caregiver':
        return jsonify({"error": "Unauthorized access"}), 403

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Dohvaćanje djece koja su pod trenutnim njegovateljem
        query = 'SELECT * FROM children WHERE caregiver_id = %s'
        cursor.execute(query, (current_user.id,))
        children = cursor.fetchall()

        cursor.close()
        connection.close()
        
        return jsonify(children)
    
    except Exception as e:
        app.logger.error("Database error: %s", str(e))
        return jsonify({"error": "Failed to retrieve children"}), 500

# Konfiguracija za Flask-Mail
app.config['MAIL_SERVER'] = 'smtp.gmail.com' # Postavlja SMTP server za slanje e-mailova na Gmailov server
app.config['MAIL_PORT'] = 465 # Postavlja port za SMTP server; 465 je standardni port za SSL
app.config['MAIL_USERNAME'] = '' # Postavlja korisničko ime za autentifikaciju na SMTP serveru (e-mail adresa)
app.config['MAIL_PASSWORD'] = '' # Postavlja lozinku za autentifikaciju na SMTP serveru (treba biti sigurnije sa okruženjima ili varijablama okoline)
app.config['MAIL_USE_TLS'] = False # Onemogućava TLS (Transport Layer Security); koristi SSL umjesto TLS
app.config['MAIL_USE_SSL'] = True # Omogućava SSL (Secure Sockets Layer) za šifriranje veze sa SMTP serverom
mail = Mail(app) # Inicijalizuje Flask-Mail objekt sa aplikacijom

@app.route('/send_email', methods=['POST'])
def send_email():
    data = request.get_json()  # Uzimanje podataka iz JSON tijela POST zahtjeva
    msg = Message(
        subject=data['subject'], # Postavlja predmet e-maila uzet iz JSON podataka
        sender=data['email'],  # Postavlja pošiljatelja e-maila na e-mail adresu iz JSON podataka
        recipients=[''],  # Prilagodite ovo na pravi e-mail za primanje
        body=data['message'] # Postavlja sadržaj e-maila na poruku iz JSON podataka
    )
    try:
        mail.send(msg)  # Pokušava poslati e-mail koristeći Flask-Mail
        return jsonify({'message': 'Email sent successfully!'}), 200 # Ako je e-mail poslan uspješno, vraća poruku o uspjehu sa statusom 200 (OK)
    except Exception as e: # Ako dođe do greške prilikom slanja e-maila, ispisuje grešku u konzolu
        print(e)
        return jsonify({'error': 'Failed to send email'}), 500 # Vraća poruku o grešci sa statusom 500 (unutarnja greška servera)

@app.route('/api/vrijeme', methods=['GET'])
def get_time_and_weather():
    # Dobijanje trenutnog datuma i vremena
    now = datetime.now()
    current_time = now.strftime("%Y-%m-%d %H:%M:%S")

    # Slanje zahteva OpenWeatherMap API-ju za vremensku prognozu
    weather_response = requests.get(WEATHER_URL)
    weather_data = weather_response.json()

    if weather_response.status_code == 200:
        temperature = weather_data['main']['temp']
        description = weather_data['weather'][0]['description']
        weather = {
            'temperature': temperature,
            'description': description
        }
    else:
        weather = {
            'error': 'Ne može se dobiti vremenska prognoza.'
        }

    return jsonify({
        'datum_i_vrijeme': current_time,
        'vremenska_prognoza': weather
    })


@app.route('/uploads/<filename>')  # Definiše datoteku iz konfiguriranog foldera 'UPLOAD_FOLDER' prema nazivu datoteke
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

def allowed_file(filename):  # Definiše dozvoljene ekstenzije datoteka
    ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'}  # Provjerava da li datoteka ima dozvoljenu ekstenziju
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/uploads/<path:filename>')
def download_file(filename): # Dostavlja datoteku iz 'UPLOAD_FOLDER' prema nazivu datoteke
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/test_session', methods=['GET'])
def test_session():
    user_id = session.get('user_id') # Provjerava da li 'user_id' postoji u sesiji
    if user_id:
        return jsonify({"message": "Session is active", "user_id": user_id}), 200     # Ako 'user_id' postoji, vraća poruku sa statusom 200
    else:
        return jsonify({"error": "No active session"}), 401  # Ako 'user_id' ne postoji, vraća grešku 401 (neautorizovano)

def fetch_user_data_from_db(user_id):  # Funkcija za preuzimanje podataka o korisniku iz baze podataka

    try:
        connection = mysql.connector.connect(
            host="localhost",
            user="root",
            password="12345",
            database="bazza"
        )
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        user_data = cursor.fetchone()
        cursor.close()
        connection.close()
        return user_data
    except Exception as e:
        app.logger.error(f"Error fetching user data: {e}")
        return None

def get_user_by_id(user_id):
  
    user_data = fetch_user_data_from_db(user_id) # Preuzima podatke o korisniku iz baze podataka
    
    # Provjerava da li su svi potrebni podaci prisutni
    return User(
        user_data['id'],
        user_data['first_name'],
        user_data['last_name'],
        user_data['email'],
        user_data['role']
    )


@login_manager.user_loader
def load_user(user_id):
    user_data = fetch_user_data_from_db(user_id) # Funkcija koja se poziva kada se učitava korisnik za Flask-Login
    if user_data: # Ako su podaci pronađeni, vraća korisnika
        return User(
            user_data['id'],
            user_data['first_name'],
            user_data['last_name'],
            user_data['email'],
            user_data['role']
        )
    return None

@app.before_request
def refresh_session():
    session.modified = True   # Označava sesiju kao modificiranu svaki put kad se obradi zahtjev
# Example route requiring JWT authentication
@app.route('/protected', methods=['GET'])
@jwt_required()
def protected():  # Ruta koja zahtijeva JWT autentifikaciju
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200

    

if __name__ == '__main__':
    app.run(debug=True)  # Pokreće Flask aplikaciju u debug modu
