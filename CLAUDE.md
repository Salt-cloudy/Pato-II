# PatoII — Contexto completo para Claude Code

App HTML de una sola página para estudiar Patología II. Todo el código y datos están en un único archivo HTML (~153 enfermedades).

---

## RUTAS CRÍTICAS

| Qué | Ruta |
|-----|------|
| **HTML a editar SIEMPRE aquí** | `C:\Users\lunom\OneDrive\Escritorio\tri 10\PatoII.html` |
| **HTML GitHub (solo sync, no editar)** | `C:\Users\lunom\OneDrive\Documents\GitHub\Pato-II\PatoII.html` |
| **Imágenes fuente** | `C:\Users\lunom\OneDrive\Escritorio\tri 10\claude pc\data actualizada de pato 2 (usa esta)\imagenes microscopicas\` |
| **Imágenes GitHub** | `C:\Users\lunom\OneDrive\Documents\GitHub\Pato-II\claude pc\data actualizada de pato 2 (usa esta)\imagenes microscopicas\` |
| **Base de datos info** | `C:\Users\lunom\OneDrive\Escritorio\tri 10\claude pc\data actualizada de pato 2 (usa esta)\base de datos pato 2.txt` |
| **CLI helper** | `C:\Users\lunom\OneDrive\Documents\GitHub\Pato-II\pato2.js` |

**NUNCA leer el HTML completo** — es enorme. Usar Grep para buscar, Node.js/Edit para modificar.

---

## REGLAS FUNDAMENTALES

1. Editar siempre `tri 10\PatoII.html` primero
2. Backup antes de cada cambio
3. Sync al GitHub local después de editar
4. Push a GitHub solo cuando el usuario lo confirme explícitamente ("súbelo", "si")
5. NUNCA leer el HTML completo — usar Grep + Node.js
6. Usar `pato2.js` para operaciones estándar (contraseñas, imágenes, validación)

---

## CLI HELPER — pato2.js

```powershell
Set-Location "C:\Users\lunom\OneDrive\Documents\GitHub\Pato-II"

# Contraseñas
node pato2.js add-password CODIGO "2026-06-08T12:00:00"   # crea y hashea automático
node pato2.js list-passwords                               # lista todos los códigos
node pato2.js remove-password HASH_O_CODIGO               # elimina código

# Imágenes
node pato2.js list-images id_enfermedad                   # ver imágenes actuales
node pato2.js remove-image id_enfermedad archivo.png      # quitar imagen del HTML
node pato2.js add-images id_enfermedad "ruta1" "ruta2"    # añadir imágenes

# Utilidades
node pato2.js validate                                     # verificar JS válido
node pato2.js sync                                         # sync tri10 → GitHub local
node pato2.js stats                                        # conteo por sistema
```

---

## BACKUP

```powershell
Copy-Item "C:\Users\lunom\OneDrive\Escritorio\tri 10\PatoII.html" "C:\Users\lunom\OneDrive\Escritorio\tri 10\PatoII.html.backup" -Force
```

---

## RENOMBRAR IMÁGENES (nueva carpeta)

```powershell
$folder = "C:\Users\lunom\OneDrive\Escritorio\tri 10\claude pc\data actualizada de pato 2 (usa esta)\imagenes microscopicas\[sistema]\[organo]\[carpeta]"
$i = 1
Get-ChildItem $folder -File | Sort-Object Name | ForEach-Object {
    $new = "nombre_enfermedad{0:D2}.png" -f $i
    Rename-Item $_.FullName $new
    Write-Host "$($_.Name) → $new"
    $i++
}
```

**Reglas:** minúsculas, guiones bajos, 2 dígitos, `.png`. Screenshots se ordenan cronológico.

**Con subcarpetas** (ej. PIN alto/bajo, Gleason 3/4/5) — renombrar cada una con prefijo distinto:
```powershell
$jobs = @(
    @{ Path = "...\subcarpeta1"; Prefix = "prefijo1" },
    @{ Path = "...\subcarpeta2"; Prefix = "prefijo2" }
)
foreach ($job in $jobs) {
    $i=1; Get-ChildItem $job.Path -File | Sort-Object Name | ForEach-Object {
        $new="$($job.Prefix){0:D2}.png"-f $i; Rename-Item $_.FullName $new; $i++
    }
}
```

---

## AÑADIR ENFERMEDAD AL HTML

### 1. Renombrar imágenes (sección anterior)

### 2. Copiar imágenes al GitHub
```powershell
$src = "C:\Users\lunom\OneDrive\Escritorio\tri 10\claude pc\data actualizada de pato 2 (usa esta)\imagenes microscopicas\[ruta]"
$dst = "C:\Users\lunom\OneDrive\Documents\GitHub\Pato-II\claude pc\data actualizada de pato 2 (usa esta)\imagenes microscopicas\[misma ruta]"
New-Item -ItemType Directory -Force $dst | Out-Null
Copy-Item "$src\*.png" $dst -Force
```

### 3. Buscar info en base de datos
Grep en `base de datos pato 2.txt` con el nombre de la enfermedad, `-C 8` de contexto.

### 4. Patch script Node.js (guardar como `C:\Users\lunom\patch_X.js`, borrar tras usar)

```javascript
const fs = require('fs');
const p = 'C:\\Users\\lunom\\OneDrive\\Escritorio\\tri 10\\PatoII.html';
let c = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');

function imgs(prefix, n, ext='png') {
  return JSON.stringify(Array.from({length:n},(_,i)=>`${prefix}${String(i+1).padStart(2,'0')}.${ext}`));
}

const pBase = 'claude pc/data actualizada de pato 2 (usa esta)/imagenes microscopicas/[sistema]/[organo]/[carpeta]/[prefijo]';

const newImagesMap = `\n  'id_enfermedad':${imgs(pBase, N)}`;

const newDiseases = `\n  ,\n  {id:'id_enfermedad',system:'Sistema',organ:'Órgano',name:'Nombre',definition:'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',etiology:'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',types:'No aplica',poblacion:'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',clinical:'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',histology:'LOREM IPSUM hallazgo histologico pendiente.',imageFindings:['Hallazgo pendiente 1','Hallazgo pendiente 2','Hallazgo pendiente 3','Hallazgo pendiente 4'],evolucion:'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',tumorMarker:'No aplica',gene:'No aplica',scale:'No aplica',otros:'Lorem ipsum diferencial pendiente.',quizVar:{q:'Lorem ipsum pregunta pendiente?',opts:['A','B','C','D'],answer:0},info:'linea1\\nlinea2'}`;

// Insertar en imagesMap
const diseasesStart = c.indexOf('\nconst diseases = [');
const imagesMapCloseIdx = c.lastIndexOf('\n};', diseasesStart);
c = c.substring(0, imagesMapCloseIdx) + ',\n' + newImagesMap + '\n' + c.substring(imagesMapCloseIdx);

// Insertar en diseases
const diseasesCloseIdx = c.lastIndexOf('\n];');
c = c.substring(0, diseasesCloseIdx) + '\n' + newDiseases + '\n' + c.substring(diseasesCloseIdx);

fs.writeFileSync(p + '.tmp', c, 'utf8'); fs.renameSync(p + '.tmp', p);
console.log('OK');
```

### 5. Validar
```powershell
node pato2.js validate
node -e "const fs=require('fs');const html=fs.readFileSync('C:\\\\Users\\\\lunom\\\\OneDrive\\\\Escritorio\\\\tri 10\\\\PatoII.html','utf8');const js=html.substring(html.indexOf('const imagesMap'),html.indexOf('];',html.indexOf('const diseases'))+2).replace(/const /g,'var ');eval(js);console.log('OK — diseases:',diseases.length);"
```

---

## ACTUALIZAR IMÁGENES DE ENFERMEDAD EXISTENTE

**Reemplazar todas:** Usar `pato2.js` o Edit tool en la línea del imagesMap.

**Eliminar una imagen específica:**
```powershell
node pato2.js remove-image id_enfermedad archivo_a_eliminar.png
```
O con Edit tool: buscar la cadena exacta del archivo y quitarla del array (con su coma).

**Añadir imágenes nuevas a enfermedad existente:**
```powershell
node pato2.js add-images id_enfermedad "ruta/nueva01.png" "ruta/nueva02.png"
```

**⚠ Verificar siempre el path correcto:**
- Femenino antiguo: `femenino/[1-8]-[organo]/[carpeta]/`
- Femenino nuevo:   `1-Femenino/[1-8]-[organo]/[carpeta]/`
- Urinario:         `2-Urinario/[carpeta]/`
- Masculino pene:   `3-Masculino/1-pene/[carpeta]/`
- Masculino testíc: `3-Masculino/2-testiculo y epididimo/[carpeta]/`
- Masculino próst:  `3-Masculino/3-prostata/[carpeta]/`

---

## CONTRASEÑAS DE ACCESO

**Sistema:** Solo GitHub Pages (`*.github.io`) requiere contraseña. Local = bypass automático.
Los códigos están en `ACCESS_CFG.codes[]` dentro del HTML (~línea 441).
`tryCode()` convierte a UPPERCASE antes de hashear → hashear siempre en mayúsculas.

```powershell
# Crear código (forma más segura — usa pato2.js):
node pato2.js add-password CODIGO "2026-06-08T12:00:00"

# Listar:
node pato2.js list-passwords

# Eliminar:
node pato2.js remove-password HASH_COMPLETO_O_CODIGO

# Manual (solo si pato2.js no está):
node -e "const c=require('crypto');console.log(c.createHash('sha256').update('CODIGO_MAYUS').digest('hex'));"
# Luego usar Edit tool para añadir: { hash: 'RESULTADO', expires: 'YYYY-MM-DDTHH:MM:SS' },
```

**Formato fecha:** `'2026-12-31'` (medianoche) o `'2026-06-08T12:00:00'` (hora exacta)

---

## ESTRUCTURA DEL DISEASE OBJECT

```javascript
{id:'snake_case_sin_acentos', system:'Femenino', organ:'Vulva', name:'Nombre Con Acentos',
 definition:'Lorem ipsum...', etiology:'Lorem ipsum...', types:'No aplica',
 poblacion:'Lorem ipsum...', clinical:'Lorem ipsum...',
 histology:'LOREM IPSUM hallazgo histologico pendiente.',
 imageFindings:['Hallazgo pendiente 1','Hallazgo pendiente 2','Hallazgo pendiente 3','Hallazgo pendiente 4'],
 evolucion:'Lorem ipsum...', tumorMarker:'No aplica', gene:'No aplica', scale:'No aplica',
 otros:'Lorem ipsum diferencial pendiente.',
 quizVar:{q:'Lorem ipsum pregunta pendiente?',opts:['A','B','C','D'],answer:0},
 info:'linea1\nlinea2\nlinea3'}  // del TXT; omitir campo si no hay info
```

**system:** `'Femenino'` | `'Masculino'` | `'Urinario'`
**organ:** con acentos. Urinario usa `'Vejiga'` o `'Uretra'` (el quiz los agrupa como `'Vías Urinarias'`)

---

## SYNC SEGURO AL GITHUB LOCAL

```powershell
# Opción 1 (PowerShell):
$src = Get-Content "C:\Users\lunom\OneDrive\Escritorio\tri 10\PatoII.html" -Raw -Encoding UTF8
Set-Content "C:\Users\lunom\OneDrive\Documents\GitHub\Pato-II\PatoII.html" $src -Encoding UTF8 -NoNewline

# Opción 2 — si el archivo está bloqueado (más confiable):
node -e "const fs=require('fs');fs.writeFileSync('C:\\\\Users\\\\lunom\\\\OneDrive\\\\Documents\\\\GitHub\\\\Pato-II\\\\PatoII.html',fs.readFileSync('C:\\\\Users\\\\lunom\\\\OneDrive\\\\Escritorio\\\\tri 10\\\\PatoII.html','utf8'),'utf8');console.log('OK');"

# Opción 3 (CLI):
node pato2.js sync
```

---

## PUSH A GITHUB

```bash
cd "C:\Users\lunom\OneDrive\Documents\GitHub\Pato-II"
git add .
git commit -m "descripción breve"
git push
```

**Errores comunes:**
- `Filename too long` → `git config core.longpaths true` y reintentar
- `rejected (fetch first)` → `git pull --rebase` o `git push --force origin main`
- `untracked files would be overwritten` → `git add .` primero, luego commit, luego rebase/push

---

## ESTADO ACTUAL (2026-06-05) — 153 enfermedades

| Sistema | Órganos | Total |
|---------|---------|-------|
| Femenino | Vulva(15), Vagina(6), Cérvix(12), Trompa Uterina(5), Endometrio(11), Ovario(18), Miometrio(3), Mama(22) | 110 |
| Urinario | Vejiga/Uretra → quiz: "Vías Urinarias" | 16 |
| Masculino | Pene(4), Testículo(12), Epidídimo(3), Próstata(10) | 27 |

---

## QUIZ CONFIG (JavaScript)

- `ORGAN_GROUPS = {'Vías Urinarias': ['Vejiga','Uretra']}` → agrupa Urinario en 1 chip
- Filtro cascada: Sistema → Órgano → Enfermedad (todos multi-select)
- `pato2.js validate` verifica que el JS es válido antes de cualquier push
