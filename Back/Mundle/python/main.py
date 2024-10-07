import mysql.connector
import requests
import time
from bs4 import BeautifulSoup
import urllib3


db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="root",
    database="mundle"
)

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
cursor = db.cursor()

cursor.execute("SELECT id, nombre FROM paises WHERE imagen IS NULL")
elementos = cursor.fetchall()

def buscar_imagen_google(nombre):
    url = f"https://www.google.com/search?q={nombre}+mapa&tbm=isch"  
    response = requests.get(url, verify=False)  
    soup = BeautifulSoup(response.text, "html.parser")  

    img_tag = soup.find_all("img")

    if img_tag is not None:
        img = img_tag[1]
    return img['src']


for elemento in elementos:
    id, nombre = elemento
    link_imagen = buscar_imagen_google(nombre)
    
    if link_imagen:
        query = "UPDATE paises SET imagen = %s WHERE id = %s"
        cursor.execute(query, (link_imagen, id))
        db.commit()
    time.sleep(0.2)

cursor.close()
db.close()
