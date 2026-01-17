# Mapeo de Colores - Holística → Perfumería

## Cambios de Colores en Tailwind

### Colores Principales:
- `earth` → `rose` (Rosa suave)
- `beige` → `champagne` (Champagne elegante)
- `terracotta` → `gold` (Oro/dorado)
- `moss` → `lavender` (Lavanda)

### Variantes:
- `earth-dark` → `rose-dark`
- `earth-light` → `rose-light`
- `beige-dark` → `champagne-dark`
- `beige-light` → `champagne-light`
- `terracotta-dark` → `gold-dark`
- `terracotta-light` → `gold-light`
- `moss-dark` → `lavender-dark`
- `moss-light` → `lavender-light`

### Ejemplos de Uso:
```jsx
// Antes (Holística)
className="bg-earth text-white"
className="hover:bg-earth-dark"
className="bg-beige-light/30"
className="text-terracotta"

// Después (Perfumería)
className="bg-rose text-white"
className="hover:bg-rose-dark"
className="bg-champagne-light/30"
className="text-gold"
```

## Nota Importante:
Por el momento, para que el proyecto funcione rápidamente, voy a mantener los nombres antiguos en Tailwind config como alias. Esto permite que el proyecto funcione sin romper nada mientras hacemos la migración gradual.
