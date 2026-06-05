# PatoII — Contexto para Claude Code

Aplicación HTML de una sola página para estudiar Patología II. Todo el código y datos están en un único archivo HTML.

## Rutas críticas

| Qué | Dónde |
|-----|-------|
| **HTML a editar** | `C:\Users\lunom\OneDrive\Escritorio\tri 10\PatoII.html` |
| **HTML GitHub (solo sync)** | `C:\Users\lunom\OneDrive\Documents\GitHub\Pato-II\PatoII.html` |
| **Imágenes fuente** | `C:\Users\lunom\OneDrive\Escritorio\tri 10\claude pc\data actualizada de pato 2 (usa esta)\imagenes microscopicas\` |
| **Imágenes GitHub** | `C:\Users\lunom\OneDrive\Documents\GitHub\Pato-II\claude pc\data actualizada de pato 2 (usa esta)\imagenes microscopicas\` |
| **Base de datos (info)** | `C:\Users\lunom\OneDrive\Escritorio\tri 10\claude pc\data actualizada de pato 2 (usa esta)\base de datos pato 2.txt` |
| **CLI helper** | `C:\Users\lunom\OneDrive\Documents\GitHub\Pato-II\pato2.js` |

## Regla fundamental

**SIEMPRE editar `tri 10\PatoII.html` primero.** Luego sync al GitHub local. Push solo cuando el usuario lo confirme.

**NUNCA leer el HTML completo** — es demasiado grande. Usar Grep para buscar, Node.js para editar.

## Backup antes de cada cambio

```powershell
Copy-Item "C:\Users\lunom\OneDrive\Escritorio\tri 10\PatoII.html" "C:\Users\lunom\OneDrive\Escritorio\tri 10\PatoII.html.backup" -Force
```

## CLI helper (pato2.js) — úsalo siempre que puedas

```powershell
# Ver ayuda completa
node pato2.js help

# Contraseñas
node pato2.js add-password CODIGO "2026-06-08T12:00:00"
node pato2.js list-passwords
node pato2.js remove-password HASH_O_CODIGO

# Imágenes
node pato2.js list-images id_enfermedad
node pato2.js remove-image id_enfermedad nombre_archivo.png
node pato2.js add-images id_enfermedad "ruta/imagen01.png" "ruta/imagen02.png"

# Utilidades
node pato2.js validate
node pato2.js sync
node pato2.js stats
```

## Sync manual (si pato2.js no está disponible)

```javascript
// Con Node.js (más confiable que PowerShell cuando el archivo está bloqueado)
node -e "const fs=require('fs');const c=fs.readFileSync('C:\\\\Users\\\\lunom\\\\OneDrive\\\\Escritorio\\\\tri 10\\\\PatoII.html','utf8');fs.writeFileSync('C:\\\\Users\\\\lunom\\\\OneDrive\\\\Documents\\\\GitHub\\\\Pato-II\\\\PatoII.html',c,'utf8');console.log('OK');"
```

## Push a GitHub

```bash
cd "C:\Users\lunom\OneDrive\Documents\GitHub\Pato-II"
git add .
git commit -m "descripción"
git push
# Si falla por rutas largas: git config core.longpaths true
# Si falla por divergencia: git push --force origin main
```

## Validar JS del HTML

```powershell
node -e "const fs=require('fs');const html=fs.readFileSync('C:\\\\Users\\\\lunom\\\\OneDrive\\\\Escritorio\\\\tri 10\\\\PatoII.html','utf8');const js=html.substring(html.indexOf('const imagesMap'),html.indexOf('];',html.indexOf('const diseases'))+2).replace(/const /g,'var ');eval(js);console.log('OK — diseases:',diseases.length,'| imagesMap:',Object.keys(imagesMap).length);"
```

## Estructura del diseases array

```javascript
{
  id:'nombre_id',           // snake_case sin acentos
  system:'Femenino',        // 'Femenino' | 'Masculino' | 'Urinario'
  organ:'Vulva',            // con acentos. Urinario: 'Vejiga' o 'Uretra' (quiz los agrupa como 'Vías Urinarias')
  name:'Nombre Completo',
  definition:'Lorem ipsum...',
  etiology:'Lorem ipsum...',
  types:'No aplica',
  poblacion:'Lorem ipsum...',
  clinical:'Lorem ipsum...',
  histology:'LOREM IPSUM hallazgo histologico pendiente.',
  imageFindings:['Hallazgo pendiente 1','Hallazgo pendiente 2','Hallazgo pendiente 3','Hallazgo pendiente 4'],
  evolucion:'Lorem ipsum...',
  tumorMarker:'No aplica',
  gene:'No aplica',
  scale:'No aplica',
  otros:'Lorem ipsum diferencial pendiente.',
  quizVar:{q:'Lorem ipsum pregunta pendiente?',opts:['A','B','C','D'],answer:0},
  info:'linea1\nlinea2\nlinea3'  // del TXT; omitir si no hay info
}
```

## Paths de imágenes por sistema

```
Femenino antiguo : claude pc/.../imagenes microscopicas/femenino/[organo]/[carpeta]/archivo.png
Femenino nuevo   : claude pc/.../imagenes microscopicas/1-Femenino/[organo]/[carpeta]/archivo.png
Urinario         : claude pc/.../imagenes microscopicas/2-Urinario/[carpeta]/archivo.png
Masculino pene   : claude pc/.../imagenes microscopicas/3-Masculino/1-pene/[carpeta]/archivo.png
Masculino testíc.: claude pc/.../imagenes microscopicas/3-Masculino/2-testiculo y epididimo/[carpeta]/archivo.png
Masculino próst. : claude pc/.../imagenes microscopicas/3-Masculino/3-prostata/[carpeta]/archivo.png
```

## Naming de imágenes

`nombre_enfermedad01.png`, `nombre_enfermedad02.png` ... (siempre 2 dígitos, minúsculas, guiones bajos)

## Auth / contraseñas

- Local (file://, OneDrive): sin contraseña — bypass automático
- GitHub Pages: requiere código de acceso (SHA-256 hasheado, UPPERCASE antes de hashear)
- Códigos en `ACCESS_CFG.codes[]` dentro del HTML (~línea 441)
- Usar `pato2.js add-password` para crear códigos sin riesgo de error

## Estado actual (2026-06-05)

153 enfermedades: Femenino (109) + Urinario (16) + Masculino (28)
