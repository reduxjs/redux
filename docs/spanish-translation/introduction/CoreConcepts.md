---
id: core-concepts
title: Core Concepts
description: "Introduction > Core Concepts: A quick overview of Redux's key idea, reducer functions"
---

# Core Concepts

# Conceptos Clave

Imagine your app’s state is described as a plain object. For example, the state of a todo app might look like this:

Imagina que el estado de tu aplicación esta descrito como un simple objeto. Por ejemplo, el estado de una aplicación de tareas podría verse así:  

```js
{
  todos: [{
    text: 'Eat food',
    completed: true
  }, {
    text: 'Exercise',
    completed: false
  }],
  visibilityFilter: 'SHOW_COMPLETED'
}
```

```js
{
  todos: [{
    texto: 'Comer comida',
    completado: true
  }, {
    texto: 'Ejercicio',
    completado: false
  }],
  filtroDeVisualizacion: 'MOSTRAR_COMPLETADO'
}
```

This object is like a “model” except that there are no setters. This is so that different parts of the code can’t change the state arbitrarily, causing hard-to-reproduce bugs.

Este objecto es como un “modelo” excepto que no hay setters. Esto es así para que diferentes partes del código no puedan cambiar el estado arbitrariamente, causando errores difíciles de reproducir.  

To change something in the state, you need to dispatch an action. An action is a plain JavaScript object (notice how we don’t introduce any magic?) that describes what happened. Here are a few example actions:

Para cambiar algo en el estado, necesitas despachar una acción. Una acción es un objecto simple de JavaScript (¿notas como no introducimos nada mágico?) que describe lo que ha pasado. Aquí hay algunos ejemplos de acciones: 

```js
{ type: 'ADD_TODO', text: 'Go to swimming pool' }
{ type: 'TOGGLE_TODO', index: 1 }
{ type: 'SET_VISIBILITY_FILTER', filter: 'SHOW_ALL' }
```

```js
{ tipo: 'AGREGAR_TAREA', texto: 'Ve a la piscina' }  
{ tipo: 'ALTERNAR_TAREA', indice: 1 } 
{ tipo: 'ESTABLECER_FILTRO_DE_VISIBILIDAD', filtro: 'MOSTRAR_TODAS' } 
```

Enforcing that every change is described as an action lets us have a clear understanding of what’s going on in the app. If something changed, we know why it changed. Actions are like breadcrumbs of what has happened.

Obligar que cada cambio sea descrito como una acción nos permite comprender claramente lo que está pasando en la aplicación. Si algo cambió, sabemos porque cambió. Las acciones son como restos de lo que ha pasado.

Finally, to tie state and actions together, we write a function called a reducer. Again, nothing magical about it—it’s just a function that takes state and action as arguments, and returns the next state of the app.

Finalmente, para unir el estado y las acciones, escribimos una función llamada 'reducer'. Otra vez, no tiene nada de magia, es solo una función que toma el estado y acción como argumentos, y devuelve el siguiente estado de la aplicación. 

It would be hard to write such a function for a big app, so we write smaller functions managing parts of the state:

Sería difícil de escribir una función así para una gran aplicación, así que escribimos funciones más pequeñas que manejan partes del estado:

```js
function visibilityFilter(state = 'SHOW_ALL', action) {
  if (action.type === 'SET_VISIBILITY_FILTER') {
    return action.filter
  } else {
    return state
  }
}

function todos(state = [], action) {
  switch (action.type) {
    case 'ADD_TODO':
      return state.concat([{ text: action.text, completed: false }])
    case 'TOGGLE_TODO':
      return state.map((todo, index) =>
        action.index === index
          ? { text: todo.text, completed: !todo.completed }
          : todo
      )
    default:
      return state
  }
}
```

```js
function filtroDeVisualizacion(estado = 'MOSTRAR_TODAS', accion) { 
  if (accion.tipo === 'ESTABLECER_FILTRO_DE_VISUALIZACION') {
    return accion.filtro
  } else {
    return estado
  }
}

function tareas(estado = [], accion) { 
  switch (accion.tipo) {
    case 'AGREGAR_TAREA':
      return estado.concat([{ texto: accion.texto, completado: false }])
    case 'ALTERNAR_TAREA':
      return estado.map((tarea, indice) =>
        accion.indice === indice
          ? { texto: tarea.texto, completado: !tarea.completada }
          : tarea
      )
    default:
      return estado
  }
}
```

And we write another reducer that manages the complete state of our app by calling those two reducers for the corresponding state keys:

Y escribimos otro reducer que maneja el estado completo de nuestra aplicación llamando a esos dos reducers por sus correspondientes llaves de estado.

```js
function todoApp(state = {}, action) {
  return {
    todos: todos(state.todos, action),
    visibilityFilter: visibilityFilter(state.visibilityFilter, action)
  }
}
```

```js
function aplicacionDeTareas(estado = {}, accion) {
  return {
    tareas: tareas(estado.tareas, accion),
    filtroDeVisualizacion: filtroDeVisualizacion(estado.filtroDeVisualizacion, accion)
  }
}
```

This is basically the whole idea of Redux. Note that we haven’t used any Redux APIs. It comes with a few utilities to facilitate this pattern, but the main idea is that you describe how your state is updated over time in response to action objects, and 90% of the code you write is just plain JavaScript, with no use of Redux itself, its APIs, or any magic.

Esta es básicamente toda la idea de Redux. Nota que no hemos utilizado ninguna API de Redux. Viene con algunas utilidades para facilitar este patrón, pero la idea principal es que describas cómo tu estado se actualiza en el tiempo en respuesta a los objectos-acciones, y 90% del código que escribes es solo simple JavaScript, sin uso de Redux en sí mismo, sus APIs, o ningún tipo de magia.
