<img src="https://github.com/fractalPlatform/Fractal.js/blob/master/assets/textlogo.png" width="520px">

Construye tus ideas tan simple como sea posible. Fractal.js es un framework intuitivo para construir aplicaciones y contenido interactivo.

Tomamos lo mejor de [functional-frontend-architecture](https://github.com/paldepind/functional-frontend-architecture) y la arquitectura [ELM](https://github.com/evancz/elm-architecture-tutorial/) (Modelos Vista Actualizador), lo adaptamos con patrones fáciles de utilizar en la `Programación Funcional Reactiva` ([Functional Reactive Programing](https://en.wikipedia.org/wiki/Functional_reactive_programming)).

(TODO: Update. Translate the english version)

## ¿Por qué?

- Es claro y conciso.
- Muestra los patrones de gran alcance que permiten realizar aplicaciones grandes o pequeñas.
- Tú código es flexible, componible y reusable.
- El estado está aislado, esto permite que sea serializado y la aplicación se pueda actualizar sin que el usuario tenga que recargarla y sin perder el estado actual.

## Caraceristicas

- Patrones predefinidos con todo lo necesario para construir aplicaciones sorprendentes
- Poderosa herramienta de composisión
- Tus aplicaciones NO tienen [efectos colaterales](https://es.wikipedia.org/wiki/Efecto_secundario_(inform%C3%A1tica))
- Puedes hacer [carga perezosa](https://es.wikipedia.org/wiki/Lazy_loading) de tus módulos.
- Módulo `router` para una fácil integración URL
- Herramientas para la integración con `socket.io`
- Renderizado del lado del servidor (En proceso)

## Has tu propia aplicación basada en Fractal.js

El método recomendado es utilizar webpack, por favor descarge el repositorio [fractal-quickstart](https://github.com/fractalPlatform/Fractal.js-quickstart)

O llame la librería desde su navegador con:

```
<script src="dist/fractal.min.js"></script>
```

O en nodejs, browserify, webpack como entornos:

```
npm i --save fractal-js
```

### Para correr los ejemplos

Hay muchos ejemplos útiles en la carpeta de `ejemplos` y se ejecutan así:

```
cd fractal-js
```

```
npm run general NAME_EXAMPLE
```

En algunos necesitas un `servidor` (e.j. Chat), en la carpeta del ejemplo se ejecutan `node server`, mire el README del ejemplo que quiere ejecutar.
