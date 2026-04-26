import matplotlib.pyplot as plt

# ==========================================
# 1. Gráfico de Barras: Seguridad y Tranquilidad
# ==========================================
def generar_grafico_barras():
    categorias = ["Sí, definitivamente", "Tal vez", "No, igual", "Falsa seguridad"]
    valores = [26, 12, 6, 2]

    plt.figure(figsize=(8, 5))
    barras = plt.bar(categorias, valores, color=['#4CAF50', '#FFC107', '#FF9800', '#F44336'])
    plt.title("¿Saber dónde viene el camión mejoraría tu seguridad?", fontsize=14)
    plt.ylabel("Número de personas")
    
    # Agregar los valores numéricos sobre cada barra
    for barra in barras:
        yval = barra.get_height()
        plt.text(barra.get_x() + barra.get_width()/2, yval + 0.5, int(yval), ha='center', va='bottom')

    plt.tight_layout()
    plt.savefig("1_grafico_barras.png")
    plt.close()

# ==========================================
# 2. Gráfico Circular (Pastel): Utilidad
# ==========================================
def generar_grafico_pastel():
    etiquetas = ["Muy útil", "Útil", "Neutral", "Poco útil"]
    valores = [28, 12, 4, 2] # Se omite "Nada útil" por tener 0
    colores = ['#2196F3', '#03A9F4', '#00BCD4', '#009688']

    plt.figure(figsize=(7, 7))
    plt.pie(valores, labels=etiquetas, autopct='%1.1f%%', startangle=140, colors=colores)
    plt.title("Utilidad de la página web para rastrear camiones", fontsize=14)
    
    plt.tight_layout()
    plt.savefig("2_grafico_pastel.png")
    plt.close()

# ==========================================
# 3. Gráfico de Líneas: Horarios de mayor espera
# ==========================================
def generar_grafico_lineas():
    horarios = ["6-8 AM", "8-10 AM", "10-12 PM", "12-2 PM", "2-4 PM", "4-6 PM", "6-8 PM"]
    personas = [18, 5, 2, 6, 3, 8, 4]

    plt.figure(figsize=(9, 5))
    plt.plot(horarios, personas, marker='o', linestyle='-', color='#9C27B0', linewidth=2, markersize=8)
    plt.title("Horarios con mayor incertidumbre y espera", fontsize=14)
    plt.xlabel("Hora del día")
    plt.ylabel("Número de personas afectadas")
    plt.grid(True, linestyle='--', alpha=0.6)
    
    plt.tight_layout()
    plt.savefig("3_grafico_lineas.png")
    plt.close()

# ==========================================
# 4. Histograma: Tiempo de espera actual
# ==========================================
def generar_histograma():
    # Recreando los datos para que coincidan con las frecuencias:
    # 0-10(4), 11-20(14), 21-30(18), 31-40(8), 41-50(2)
    datos_espera = ([5] * 4) + ([15] * 14) + ([25] * 18) + ([35] * 8) + ([45] * 2)

    plt.figure(figsize=(8, 5))
    plt.hist(datos_espera, bins=[0, 10, 20, 30, 40, 50], edgecolor='black', color='#3F51B5', alpha=0.8)
    plt.title("Distribución del tiempo de espera en la parada", fontsize=14)
    plt.xlabel("Minutos de espera")
    plt.ylabel("Frecuencia (Personas)")
    plt.xticks([5, 15, 25, 35, 45], ['0-10', '11-20', '21-30', '31-40', '41-50+'])
    
    plt.tight_layout()
    plt.savefig("4_histograma.png")
    plt.close()

# ==========================================
# 5. Diagrama de Dispersión: Espera vs Ahorro estimado
# ==========================================
def generar_diagrama_dispersion():
    # Eje X: Tiempo que esperan actualmente
    espera_actual = [10, 15, 25, 30, 45, 20, 30, 15, 35, 40, 25, 30, 12, 28, 32, 18, 22, 42, 30, 25, 15, 30, 20, 35, 50, 28, 24, 16, 30, 38, 25, 40, 20, 30, 14, 26, 34, 28, 22, 46, 30, 25, 15, 32, 20, 36]
    # Eje Y: Tiempo que estiman ahorrar
    ahorro_estimado = [5, 10, 15, 20, 30, 10, 15, 5, 20, 25, 15, 25, 5, 15, 20, 10, 10, 30, 20, 15, 10, 15, 10, 25, 35, 15, 15, 5, 20, 25, 10, 20, 15, 25, 5, 15, 20, 10, 15, 30, 20, 15, 5, 25, 10, 20]

    plt.figure(figsize=(8, 5))
    plt.scatter(espera_actual, ahorro_estimado, color='#E91E63', alpha=0.7, edgecolors='black', s=50)
    plt.title("Relación entre Tiempo de Espera y Ahorro Estimado", fontsize=14)
    plt.xlabel("Tiempo de espera actual (minutos)")
    plt.ylabel("Tiempo de ahorro estimado (minutos)")
    plt.grid(True, linestyle='--', alpha=0.5)
    
    plt.tight_layout()
    plt.savefig("5_diagrama_dispersion.png")
    plt.close()

# ==========================================
# Ejecución
# ==========================================
if __name__ == "__main__":
    print("Generando gráficas...")
    generar_grafico_barras()
    generar_grafico_pastel()
    generar_grafico_lineas()
    generar_histograma()
    generar_diagrama_dispersion()
    print("¡Listo! Revisa la carpeta actual, se han guardado 5 archivos PNG.")