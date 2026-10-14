const API_URL = "http://localhost:3000";

// ===== Elementos del DOM (productos) =====
const listaProductos = document.getElementById("listaProductos");
const formulario = document.getElementById("formularioProducto");
const productoId = document.getElementById("productoId");
const nombreInput = document.getElementById("nombre");
const precioInput = document.getElementById("precio");
const stockInput = document.getElementById("stock");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const tituloFormulario = document.getElementById("tituloFormulario");

// ===== Elementos del DOM (contacto) =====
const formContacto = document.getElementById("formularioContacto");
const listaMensajes = document.getElementById("listaMensajes");

// 1. Función para consultar los productos y mostrarlos en el DOM (READ)
async function cargarProductos() {
  if (!listaProductos) return; // Si la página no tiene productos (contacto.html), no hace nada

  try {
    const respuesta = await fetch(`${API_URL}/productos`);
    const productos = await respuesta.json();

    listaProductos.innerHTML = "";

    if (productos.length === 0) {
      listaProductos.innerHTML = "<p style='color: #64748b;'>No hay productos registrados.</p>";
      return;
    }

    productos.forEach((producto) => {
      const elemento = document.createElement("div");
      elemento.classList.add("producto");

      elemento.innerHTML = `
        <div>
          <h3>${producto.nombre}</h3>
          <p class="producto-precio">Precio: $${producto.precio}</p>
          <p>Stock: ${producto.stock} unidades</p>
        </div>
        <div class="acciones">
          <button class="btn-editar" onclick="cargarEnFormulario(${producto.id}, '${producto.nombre}', ${producto.precio}, ${producto.stock})">Editar</button>
          <button class="btn-eliminar" onclick="eliminarProducto(${producto.id})">Eliminar</button>
        </div>
      `;

      listaProductos.appendChild(elemento);
    });
  } catch (error) {
    console.error("Error al cargar productos:", error);
  }
}

// 2. Cargar datos del producto en el formulario para editar (UPDATE - Paso 1)
function cargarEnFormulario(id, nombre, precio, stock) {
  productoId.value = id;
  nombreInput.value = nombre;
  precioInput.value = precio;
  stockInput.value = stock;

  tituloFormulario.textContent = "Editar Producto";
  btnGuardar.textContent = "Actualizar Producto";
  btnCancelar.style.display = "block";
  nombreInput.focus();
}

// Cancelar edición y restaurar formulario
function cancelarEdicion() {
  formulario.reset();
  productoId.value = "";
  tituloFormulario.textContent = "Registrar Producto";
  btnGuardar.textContent = "Guardar Producto";
  btnCancelar.style.display = "none";
}

if (btnCancelar) {
  btnCancelar.addEventListener("click", cancelarEdicion);
}

// 3. Guardar o Actualizar según si hay un ID seleccionado (CREATE o UPDATE)
if (formulario) {
  formulario.addEventListener("submit", async (event) => {
    event.preventDefault(); // Evitar que la página se recargue

    const id = productoId.value;
    const nombre = nombreInput.value;
    const precio = precioInput.value;
    const stock = stockInput.value;

    try {
      if (id) {
        // MODO ACTUALIZAR (PUT)
        await fetch(`${API_URL}/productos/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre, precio, stock }),
        });
      } else {
        // MODO CREAR (POST)
        await fetch(`${API_URL}/productos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre, precio, stock }),
        });
      }

      cancelarEdicion(); // Limpiar formulario y restaurar botones
      cargarProductos(); // Refrescar la lista en pantalla
    } catch (error) {
      console.error("Error al guardar el producto:", error);
    }
  });
}

// 4. Eliminar un producto (DELETE)
async function eliminarProducto(id) {
  const confirmar = confirm("¿Deseas eliminar este producto de la base de datos?");
  if (!confirmar) return;

  try {
    await fetch(`${API_URL}/productos/${id}`, {
      method: "DELETE",
    });

    // Si estábamos editando ese mismo producto, cancelamos la edición
    if (productoId && productoId.value == id) {
      cancelarEdicion();
    }

    cargarProductos(); // Refrescar la lista en pantalla
  } catch (error) {
    console.error("Error al eliminar producto:", error);
  }
}

// ===================================================
// 5. MENSAJES DE CONTACTO (contacto.html)
// ===================================================

// Evita que el texto escrito por el usuario se interprete como HTML
function escapar(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

// GET: cargar el historial de mensajes
async function cargarMensajes() {
  if (!listaMensajes) return; // Si la página no tiene historial (index.html), no hace nada

  try {
    const respuesta = await fetch(`${API_URL}/mensajes`);
    const mensajes = await respuesta.json();

    listaMensajes.innerHTML = "";

    if (mensajes.length === 0) {
      listaMensajes.innerHTML = "<p style='color: #64748b;'>No hay mensajes enviados.</p>";
      return;
    }

    mensajes.forEach((m) => {
      const fecha = new Date(m.fecha_envio).toLocaleString("es-MX");
      const elemento = document.createElement("div");
      elemento.classList.add("producto");

      // CORREGIDO: la BD devuelve nombre_completo y correo_electronico
      // (antes se leía m.nombre y m.correo, que no existen y salían "undefined")
      elemento.innerHTML = `
        <div>
          <h3>${escapar(m.asunto)}</h3>
          <p><strong>${escapar(m.nombre_completo)}</strong> (${escapar(m.correo_electronico)})</p>
          <p>${escapar(m.mensaje)}</p>
          <p style="color:#64748b; font-size:0.85rem;">${fecha}</p>
        </div>
        <div class="acciones">
          <button class="btn-eliminar" onclick="eliminarMensaje(${m.id})">Eliminar</button>
        </div>
      `;
      listaMensajes.appendChild(elemento);
    });
  } catch (error) {
    console.error("Error al cargar mensajes:", error);
    listaMensajes.innerHTML = "<p style='color: #b91c1c;'>No se pudo conectar con el servidor.</p>";
  }
}

// POST: enviar un mensaje y guardarlo en la base de datos
if (formContacto) {
  formContacto.addEventListener("submit", async (e) => {
    e.preventDefault();

    // CORREGIDO: las claves deben ser IGUALES a las que espera server.js
    // (antes se enviaban "nombre" y "correo" y el servidor respondía 400)
    const datos = {
      nombre_completo: document.getElementById("contactoNombre").value.trim(),
      correo_electronico: document.getElementById("contactoCorreo").value.trim(),
      asunto: document.getElementById("contactoAsunto").value.trim(),
      mensaje: document.getElementById("contactoMensaje").value.trim(),
    };

    try {
      const respuesta = await fetch(`${API_URL}/mensajes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });

      if (!respuesta.ok) {
        // CORREGIDO: se muestra el mensaje real que devuelve el servidor
        const error = await respuesta.json().catch(() => ({}));
        alert(error.mensaje || "No se pudo enviar el mensaje");
        return;
      }

      formContacto.reset();
      cargarMensajes(); // Refrescar el historial
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      alert("Error de conexión con el servidor");
    }
  });
}

// DELETE: eliminar un mensaje de la base de datos y de la página
async function eliminarMensaje(id) {
  if (!confirm("¿Deseas eliminar este mensaje de la base de datos?")) return;

  try {
    const respuesta = await fetch(`${API_URL}/mensajes/${id}`, { method: "DELETE" });

    if (!respuesta.ok) {
      alert("No se pudo eliminar el mensaje");
      return;
    }

    cargarMensajes(); // Refrescar el historial
  } catch (error) {
    console.error("Error al eliminar mensaje:", error);
  }
}

// ===== Llamados iniciales al cargar la página =====
cargarProductos();
cargarMensajes();