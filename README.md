# Animation Vault

Raccolta di scene Three.js organizzate come pagine HTML separate, ciascuna con il proprio file JavaScript, layout condiviso e asset centralizzati.

## Cos'e questo progetto

Questo repository e' un catalogo di animazioni web costruite con Vite e Three.js.

Ogni animazione vive in modo indipendente:

- una pagina dedicata in `animazioni/`
- un file scena dedicato in `src/scenes/`
- eventuali asset condivisi in `public/textures/` o `public/models/`

Questa struttura rende semplice testare una scena isolata, mantenerla separata dalle altre e riutilizzarla in un progetto diverso.

## Come funziona

- `index.html` e' la home con card, navigazione e accesso alle singole scene.
- `animazioni/animX.html` monta una sola animazione per pagina.
- `src/scenes/animX.js` contiene logica Three.js, camera, renderer, luci, interazioni e resize.
- `src/site-header.js` gestisce l'header condiviso.
- `src/style.css` contiene il layout globale e gli stili delle pagine.

## Avvio locale

1. Installa le dipendenze:

   ```bash
   npm install
   ```

2. Avvia il server di sviluppo:

   ```bash
   npm run dev
   ```

3. Crea una build di produzione quando serve:

   ```bash
   npm run build
   ```

## Integrare una animazione in un altro progetto

Le animazioni sono gia separate, quindi puoi portarne una sola senza copiare tutto il repository.

### Passi minimi

1. Installa le dipendenze necessarie nel progetto di destinazione:

   ```bash
   npm install three
   ```

2. Copia il file della scena che ti serve:

   - da `src/scenes/animX.js`
   - verso il punto del tuo progetto dove gestisci la logica Three.js

3. Crea o riusa un container HTML con l'id atteso dalla scena:

   ```html
   <section id="animX"></section>
   ```

4. Copia gli asset richiesti dalla scena:

   - texture da `public/textures/`
   - modelli da `public/models/`
   - altri file statici eventualmente referenziati nello script

5. Aggiorna i percorsi degli asset se nel nuovo progetto cambiano cartelle o URL.

6. Se non ti serve la pagina dedicata, puoi montare la scena direttamente dentro una route o un componente gia esistente, mantenendo il container corretto.

### Cosa verificare dopo la copia

- che il container esista davvero nel DOM
- che i percorsi di texture e modelli siano validi
- che camera e renderer usino le dimensioni del container giusto
- che eventuali import da `three/examples/jsm/...` siano supportati nel nuovo bundler

### Approccio consigliato

- copia una sola animazione alla volta
- porta con te solo gli asset realmente usati da quella scena
- mantieni la scena isolata, con il suo container dedicato
- se vuoi piu animazioni nello stesso progetto, tienile separate in file diversi come in questo repository

## Nota pratica

Se aggiungi una nuova animazione in questo repo, in genere servono questi aggiornamenti:

1. crea `src/scenes/animX.js`
2. crea `animazioni/animX.html`
3. aggiungi la entry in `vite.config.js`
4. aggiungi il link nella nav condivisa
5. aggiungi la card nella home