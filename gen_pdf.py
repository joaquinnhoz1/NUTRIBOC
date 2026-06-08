from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT

OLIVE_DK  = colors.HexColor('#6E7B52')
LEAF_SOFT = colors.HexColor('#DFE5D1')
CREAM     = colors.HexColor('#FAF6EF')
SAND      = colors.HexColor('#F1E8D9')
TOSTADO_DK= colors.HexColor('#A9855C')
INK       = colors.HexColor('#2C2A22')
INK_SOFT  = colors.HexColor('#5C584B')
LINE      = colors.HexColor('#E4D9C6')
WHITE     = colors.white

W, H = A4

OUTPUT = r'C:\Users\Joaqu\Desktop\IMPULSO WEB\Nut. Brenda Coloccini\Documentacion_NUTRIBOC.pdf'

doc = SimpleDocTemplate(
    OUTPUT,
    pagesize=A4,
    rightMargin=2.2*cm,
    leftMargin=2.2*cm,
    topMargin=2.2*cm,
    bottomMargin=2.2*cm,
    title='Documentacion NUTRIBOC',
    author='Impulso Web',
)

def first_page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(CREAM)
    canvas.rect(0, 0, W, H, fill=1, stroke=0)
    canvas.setFillColor(OLIVE_DK)
    canvas.rect(0, H - 180, W, 180, fill=1, stroke=0)
    canvas.setFillColor(OLIVE_DK)
    canvas.rect(0, 0, W, 46, fill=1, stroke=0)
    # Header text
    canvas.setFillColor(CREAM)
    canvas.setFont('Helvetica-Bold', 12)
    canvas.drawCentredString(W/2, H - 70, 'NUTRIBOC')
    canvas.setFont('Helvetica', 10)
    canvas.drawCentredString(W/2, H - 92, 'Nut. Brenda Coloccini')
    # Center title
    canvas.setFillColor(INK)
    canvas.setFont('Helvetica-Bold', 34)
    canvas.drawCentredString(W/2, H/2 + 36, 'Documentacion')
    canvas.setFont('Helvetica-Bold', 34)
    canvas.drawCentredString(W/2, H/2 - 10, 'de tu sitio web')
    canvas.setFillColor(INK_SOFT)
    canvas.setFont('Helvetica', 12)
    canvas.drawCentredString(W/2, H/2 - 54, 'Guia completa: diseno, funciones y panel de administracion')
    # Stripe between title and footer
    canvas.setFillColor(LEAF_SOFT)
    canvas.rect(2.2*cm, H/2 - 90, W - 4.4*cm, 2, fill=1, stroke=0)
    # Footer
    canvas.setFillColor(CREAM)
    canvas.setFont('Helvetica', 9)
    canvas.drawCentredString(W/2, 16, 'Desarrollado por Impulso Web  |  2025')
    canvas.restoreState()

def other_pages(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(OLIVE_DK)
    canvas.rect(0, 0, W, 28, fill=1, stroke=0)
    canvas.setFillColor(CREAM)
    canvas.setFont('Helvetica', 8)
    canvas.drawString(2.2*cm, 9, 'NUTRIBOC - Documentacion del sitio web')
    canvas.drawRightString(W - 2.2*cm, 9, f'Pag. {doc.page}')
    canvas.restoreState()

def s(name, **kw):
    base = getSampleStyleSheet()['Normal']
    return ParagraphStyle(name, parent=base, **kw)

body   = s('body',   fontSize=10, textColor=INK,      leading=15, spaceAfter=6, alignment=TA_JUSTIFY)
bodyc  = s('bodyc',  fontSize=10, textColor=INK_SOFT,  leading=14, spaceAfter=4)
h2     = s('h2',     fontSize=12, textColor=OLIVE_DK,  leading=16, spaceBefore=12, spaceAfter=6, fontName='Helvetica-Bold')
blabel = s('blabel', fontSize=10, textColor=INK,       leading=14, spaceAfter=3, fontName='Helvetica-Bold')
bullet = s('bullet', fontSize=10, textColor=INK,       leading=14, spaceAfter=4, leftIndent=12, firstLineIndent=-8)
fctr   = s('fctr',   fontSize=8.5,textColor=INK_SOFT,  leading=12, alignment=TA_CENTER)

def section_header(title):
    p = Paragraph(title, s('sh', fontSize=14, textColor=WHITE, fontName='Helvetica-Bold', leading=20))
    t = Table([[p]], colWidths=[W - 4.4*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND',    (0,0),(-1,-1), OLIVE_DK),
        ('TOPPADDING',    (0,0),(-1,-1), 11),
        ('BOTTOMPADDING', (0,0),(-1,-1), 11),
        ('LEFTPADDING',   (0,0),(-1,-1), 16),
        ('RIGHTPADDING',  (0,0),(-1,-1), 16),
    ]))
    return t

def two_col(left_text, left_style, right_text, right_style, lw=5*cm, bg_l=LEAF_SOFT, bg_r=CREAM):
    rw = W - 4.4*cm - lw
    row = [[Paragraph(left_text, left_style), Paragraph(right_text, right_style)]]
    t = Table(row, colWidths=[lw, rw])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0),(0,0), bg_l),
        ('BACKGROUND', (1,0),(1,0), bg_r),
        ('BOX',        (0,0),(-1,-1), 0.5, LINE),
        ('INNERGRID',  (0,0),(-1,-1), 0.5, LINE),
        ('TOPPADDING', (0,0),(-1,-1), 9),
        ('BOTTOMPADDING',(0,0),(-1,-1), 9),
        ('LEFTPADDING',(0,0),(-1,-1), 12),
        ('RIGHTPADDING',(0,0),(-1,-1), 12),
        ('VALIGN',     (0,0),(-1,-1), 'TOP'),
    ]))
    return t

story = []

# Cover page — el canvas de first_page dibuja todo; solo necesitamos un salto
story.append(PageBreak())

# ─── ÍNDICE ───────────────────────────────────────────────────────────────────
story.append(section_header('Contenido'))
story.append(Spacer(1, 10))
toc = [
    ('1', 'Tu sitio web'),
    ('2', 'Paleta de colores'),
    ('3', 'Tipografia'),
    ('4', 'Estructura del sitio publico'),
    ('5', 'El sistema de turnos'),
    ('6', 'Panel de administracion'),
    ('7', 'Estados de una reserva'),
    ('8', 'Consejos de uso'),
]
for n, t in toc:
    story.append(Paragraph(f'<b>{n}.</b>   {t}', bodyc))
story.append(Spacer(1, 22))

# ─── 1 ────────────────────────────────────────────────────────────────────────
story.append(section_header('1 — Tu sitio web'))
story.append(Spacer(1, 12))
story.append(Paragraph('Que es?', h2))
story.append(Paragraph(
    'Tu sitio web es una pagina profesional de una sola pantalla (lo que se llama "landing page") '
    'pensada especialmente para tu actividad como nutricionista. '
    'Tiene dos partes principales: el sitio publico que ven tus pacientes, '
    'y un panel de administracion privado que solo vos podes usar.',
    body))
story.append(Spacer(1, 8))
story.append(Paragraph('Que pueden hacer tus pacientes?', h2))
for b in [
    'Ver tu presentacion profesional y como trabajas',
    'Leer como funciona el proceso de consulta paso a paso',
    'Reservar un turno online eligiendo la fecha y el horario disponible',
    'Elegir la modalidad: presencial u online',
    'Elegir como pagar: transferencia bancaria o Mercado Pago',
    'Contactarte por WhatsApp con el boton flotante visible en toda la pagina',
]:
    story.append(Paragraph(f'• {b}', bullet))
story.append(Spacer(1, 22))

# ─── 2 ────────────────────────────────────────────────────────────────────────
story.append(section_header('2 — Paleta de colores'))
story.append(Spacer(1, 12))
story.append(Paragraph(
    'La paleta fue elegida para transmitir salud, naturaleza y calidez. '
    'Son tonos que funcionan muy bien para el rubro nutricion.',
    body))
story.append(Spacer(1, 10))

color_rows = [
    ['Nombre', 'Hex', 'Uso principal'],
    ['Crema',             '#FAF6EF', 'Fondo general del sitio'],
    ['Arena',             '#F1E8D9', 'Fondos secundarios, calendario'],
    ['Arena oscura',      '#E9DCC7', 'Bordes suaves, detalles'],
    ['Tostado',           '#C9A77E', 'Acentos decorativos'],
    ['Tostado oscuro',    '#A9855C', 'Textos secundarios, etiquetas'],
    ['Oliva',             '#8C9A6E', 'Color de hojas / acento suave'],
    ['Oliva oscuro',      '#6E7B52', 'Botones principales, links activos'],
    ['Verde hoja',        '#A7B488', 'Hover, selecciones activas'],
    ['Verde hoja suave',  '#DFE5D1', 'Fondos de badges, detalles claros'],
    ['Tinta (negro cal)', '#2C2A22', 'Textos principales'],
    ['Tinta suave',       '#5C584B', 'Textos secundarios'],
    ['Linea',             '#E4D9C6', 'Bordes y separadores'],
]
col_w = [W - 4.4*cm - 5*cm - 7.5*cm, 5*cm, 7.5*cm]
ct = Table(color_rows, colWidths=col_w)
ts = TableStyle([
    ('BACKGROUND',    (0,0),(-1, 0), OLIVE_DK),
    ('TEXTCOLOR',     (0,0),(-1, 0), WHITE),
    ('FONTNAME',      (0,0),(-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE',      (0,0),(-1,-1), 9),
    ('TOPPADDING',    (0,0),(-1,-1), 6),
    ('BOTTOMPADDING', (0,0),(-1,-1), 6),
    ('LEFTPADDING',   (0,0),(-1,-1), 10),
    ('RIGHTPADDING',  (0,0),(-1,-1), 10),
    ('GRID',          (0,0),(-1,-1), 0.5, LINE),
    ('ALIGN',         (1,0),(1,-1),  'CENTER'),
    ('ROWBACKGROUNDS',(0,1),(-1,-1), [CREAM, SAND]),
])
dark_hex = {'#2C2A22','#5C584B','#A9855C','#6E7B52','#8C9A6E','#A7B488'}
for i, row in enumerate(color_rows[1:], 1):
    h = row[1]
    ts.add('BACKGROUND', (1,i),(1,i), colors.HexColor(h))
    ts.add('TEXTCOLOR',  (1,i),(1,i), WHITE if h in dark_hex else INK)
ct.setStyle(ts)
story.append(ct)
story.append(Spacer(1, 22))

# ─── 3 ────────────────────────────────────────────────────────────────────────
story.append(section_header('3 — Tipografia'))
story.append(Spacer(1, 12))
story.append(Paragraph(
    'El sitio usa dos tipografias de Google Fonts combinadas para lograr un equilibrio entre elegancia y modernidad.',
    body))
story.append(Spacer(1, 8))

typo_data = [
    [Paragraph('<b>Tipografia</b>', blabel), Paragraph('<b>Tipo</b>', blabel), Paragraph('<b>Donde se usa</b>', blabel)],
    [Paragraph('<b>Newsreader</b>', s('tn', fontSize=10, fontName='Helvetica-Bold', textColor=OLIVE_DK)),
     Paragraph('Serif (con remates)', bodyc),
     Paragraph('Titulos h1/h2/h3, titulos en cursiva, encabezados de secciones', bodyc)],
    [Paragraph('<b>Outfit</b>', s('to', fontSize=10, fontName='Helvetica-Bold', textColor=OLIVE_DK)),
     Paragraph('Sans-serif (sin remates)', bodyc),
     Paragraph('Parrafos, botones, navegacion, panel de administracion', bodyc)],
]
tw = [4.2*cm, 4.8*cm, W - 4.4*cm - 9*cm]
tt = Table(typo_data, colWidths=tw)
tt.setStyle(TableStyle([
    ('BACKGROUND',    (0,0),(-1,0), LEAF_SOFT),
    ('FONTNAME',      (0,0),(-1,0), 'Helvetica-Bold'),
    ('FONTSIZE',      (0,0),(-1,-1), 9.5),
    ('TOPPADDING',    (0,0),(-1,-1), 8),
    ('BOTTOMPADDING', (0,0),(-1,-1), 8),
    ('LEFTPADDING',   (0,0),(-1,-1), 10),
    ('ROWBACKGROUNDS',(0,1),(-1,-1), [CREAM, SAND]),
    ('GRID',          (0,0),(-1,-1), 0.5, LINE),
    ('VALIGN',        (0,0),(-1,-1), 'MIDDLE'),
]))
story.append(tt)
story.append(Spacer(1, 22))

# ─── 4 ────────────────────────────────────────────────────────────────────────
story.append(section_header('4 — Estructura del sitio publico'))
story.append(Spacer(1, 12))
story.append(Paragraph(
    'El sitio esta dividido en secciones que se van viendo a medida que el usuario hace scroll. '
    'Cada seccion aparece con una animacion suave al entrar en pantalla.',
    body))
story.append(Spacer(1, 8))

sections4 = [
    ('1. Header fijo',
     'Barra de navegacion fija arriba al hacer scroll. Incluye nombre/logo y links a las secciones. En celular se convierte en menu hamburguesa.'),
    ('2. Hero',
     'Pantalla de bienvenida con el nombre grande, titulo profesional, frase introductoria y dos botones: "Reservar turno" y "Contacto". Tiene ilustraciones flotantes animadas de alimentos.'),
    ('3. Como funciona',
     'Seccion con fondo verde oliva. Explica el proceso en 4 pasos: elegis fecha y horario > completas tus datos > abonas la consulta > te contactamos para confirmar.'),
    ('4. Agenda / Reserva de turno',
     'El corazon del sitio. Calendario interactivo para reservar turnos: modalidad > dia > horario disponible > datos personales > metodo de pago.'),
    ('5. Metodos de pago',
     'Seccion informativa que muestra las dos opciones: transferencia bancaria y Mercado Pago.'),
    ('6. Contacto',
     'Seccion con fondo verde oliva con un boton grande de WhatsApp para contacto directo.'),
    ('7. Footer',
     'Pie de pagina con links de navegacion, informacion de contacto y creditos.'),
    ('8. Boton flotante de WhatsApp',
     'Boton verde fijo en la esquina inferior derecha, visible en toda la pagina.'),
]
for label, desc in sections4:
    story.append(two_col(
        label, s('sl4', fontSize=10, fontName='Helvetica-Bold', textColor=OLIVE_DK, leading=14),
        desc,  s('sd4', fontSize=9.5, textColor=INK_SOFT, leading=13),
        lw=4.5*cm, bg_l=LEAF_SOFT, bg_r=CREAM,
    ))
    story.append(Spacer(1, 5))
story.append(Spacer(1, 22))

# ─── 5 ────────────────────────────────────────────────────────────────────────
story.append(section_header('5 — El sistema de turnos'))
story.append(Spacer(1, 12))
story.append(Paragraph('El sistema de reservas funciona en 5 pasos:', body))
story.append(Spacer(1, 8))

steps5 = [
    ('Paso 1\nElegir turno',
     'El paciente selecciona la modalidad (presencial u online), elige un dia en el calendario y luego un horario disponible. Los horarios ya tomados o bloqueados no aparecen.<br/>'
     '<b>Presencial:</b> 9:00 / 10:00 / 11:00 / 12:00 / 15:00 / 16:00 / 17:00 / 18:00<br/>'
     '<b>Online:</b> 8:00 / 9:00 / 13:00 / 14:00 / 19:00 / 20:00'),
    ('Paso 2\nDatos personales',
     'El paciente completa nombre completo, email y numero de telefono/WhatsApp.'),
    ('Paso 3\nMetodo de pago',
     'Elige entre transferencia bancaria o Mercado Pago.'),
    ('Paso 4a\nTransferencia',
     'Se muestran los datos bancarios (CBU, alias, titular, banco) y el monto. El paciente puede copiar cada dato con un boton. Luego hay un boton para enviar el comprobante por WhatsApp con el mensaje ya redactado.'),
    ('Paso 4b\nMercado Pago',
     'El paciente es redirigido al link de pago de Mercado Pago que hayas configurado en el panel de administracion.'),
    ('Paso 5\nConfirmacion',
     'Pantalla de confirmacion: turno reservado exitosamente.'),
]
for label, desc in steps5:
    story.append(two_col(
        label.replace('\n','<br/>'),
        s('sl5', fontSize=10, fontName='Helvetica-Bold', textColor=OLIVE_DK, leading=15),
        desc,
        s('sd5', fontSize=9.5, textColor=INK_SOFT, leading=13),
        lw=4.5*cm, bg_l=LEAF_SOFT, bg_r=CREAM,
    ))
    story.append(Spacer(1, 5))
story.append(Spacer(1, 22))

# ─── 6 ────────────────────────────────────────────────────────────────────────
story.append(section_header('6 — Panel de administracion'))
story.append(Spacer(1, 12))
story.append(Paragraph(
    'El panel de admin es privado y solo vos podes acceder con tu contrasena. '
    'Se accede desde: <b>tusitio.com/admin</b>',
    body))
story.append(Spacer(1, 10))

panels = [
    ('Dashboard (Inicio)',
     'Resumen general: total de reservas, confirmadas, pendientes de transferencia, '
     'pendientes de Mercado Pago, canceladas, y los proximos turnos del dia o semana.'),
    ('Reservas',
     'Lista completa con filtros por fecha, modalidad, estado de pago y metodo de pago. '
     'Muestra nombre, email, telefono, fecha, horario y estado de cada reserva. '
     'Podes confirmar o cancelar reservas manualmente.'),
    ('Horarios y bloqueos',
     'Bloquea dias enteros (vacaciones, feriados) o bloquea horarios especificos en fechas determinadas. '
     'Los dias y horarios bloqueados desaparecen del calendario para los pacientes.'),
    ('Configuracion',
     'Podes editar sin necesidad de un programador:<br/>'
     '- <b>Contacto:</b> numeros de WhatsApp del sitio y para recibir comprobantes<br/>'
     '- <b>Datos bancarios y precio:</b> CBU, alias, titular, banco y precio de la consulta<br/>'
     '- <b>Mercado Pago:</b> el link de pago de tu cuenta<br/>'
     '- <b>Contrasena:</b> cambiar la contrasena del panel en cualquier momento'),
]
for title, desc in panels:
    story.append(Paragraph(f'<b>{title}</b>', blabel))
    story.append(Paragraph(desc, s('p6', fontSize=10, textColor=INK_SOFT, leading=14, spaceAfter=10, leftIndent=12)))
story.append(Spacer(1, 22))

# ─── 7 ────────────────────────────────────────────────────────────────────────
story.append(section_header('7 — Estados de una reserva'))
story.append(Spacer(1, 12))

estados = [
    ('Pendiente',                   '#f5f5f5','#616161', 'Reserva recien creada, sin pago aun.'),
    ('Pendiente de transferencia',  '#fff3e0','#e65100', 'El paciente eligio pagar por transferencia y mando el comprobante.'),
    ('Pendiente Mercado Pago',      '#e3f2fd','#1565c0', 'El pago por Mercado Pago esta en proceso.'),
    ('Confirmada',                  '#eaf4ec','#2e7d32', 'Turno confirmado. Pago recibido o confirmado manualmente por vos.'),
    ('Cancelada',                   '#fce4ec','#c62828', 'Turno cancelado.'),
]
for estado, bg, fg, desc in estados:
    row = [[
        Paragraph(f'<b>{estado}</b>', s('est', fontSize=9.5, fontName='Helvetica-Bold', textColor=colors.HexColor(fg))),
        Paragraph(desc, s('estd', fontSize=9.5, textColor=INK_SOFT, leading=13)),
    ]]
    et = Table(row, colWidths=[5.5*cm, W - 4.4*cm - 5.5*cm])
    et.setStyle(TableStyle([
        ('BACKGROUND', (0,0),(0,0), colors.HexColor(bg)),
        ('BACKGROUND', (1,0),(1,0), CREAM),
        ('TOPPADDING', (0,0),(-1,-1), 9),
        ('BOTTOMPADDING',(0,0),(-1,-1), 9),
        ('LEFTPADDING', (0,0),(-1,-1), 12),
        ('RIGHTPADDING',(0,0),(-1,-1), 12),
        ('BOX',        (0,0),(-1,-1), 0.5, LINE),
        ('INNERGRID',  (0,0),(-1,-1), 0.5, LINE),
        ('VALIGN',     (0,0),(-1,-1), 'MIDDLE'),
    ]))
    story.append(et)
    story.append(Spacer(1, 5))
story.append(Spacer(1, 22))

# ─── 8 ────────────────────────────────────────────────────────────────────────
story.append(section_header('8 — Consejos de uso'))
story.append(Spacer(1, 12))

consejos = [
    ('Actualizá el precio de la consulta',
     'Desde Configuracion cada vez que lo modifiques. Asi el precio correcto siempre aparece en el paso de pago.'),
    ('Bloquea los dias que no trabajas',
     'Desde Horarios y bloqueos para que los pacientes no puedan reservar esos dias.'),
    ('Configura tu link de Mercado Pago',
     'Desde Configuracion > Mercado Pago. Lo encontras en tu cuenta de MP: Cobrar > Link de pago.'),
    ('Revisa el dashboard periodicamente',
     'Para ver las reservas pendientes de confirmacion y no perder ningun turno.'),
    ('Guarda tu contrasena del admin',
     'En un lugar seguro para no perder el acceso al panel.'),
]
for titulo, desc in consejos:
    row = [[
        Paragraph('<b>v</b>', s('ck', fontSize=13, textColor=OLIVE_DK, fontName='Helvetica-Bold')),
        Paragraph(f'<b>{titulo}:</b> {desc}', s('con', fontSize=10, textColor=INK, leading=14)),
    ]]
    ct2 = Table(row, colWidths=[0.9*cm, W - 4.4*cm - 0.9*cm])
    ct2.setStyle(TableStyle([
        ('BACKGROUND',    (0,0),(-1,-1), SAND),
        ('BOX',           (0,0),(-1,-1), 0.5, LINE),
        ('TOPPADDING',    (0,0),(-1,-1), 8),
        ('BOTTOMPADDING', (0,0),(-1,-1), 8),
        ('LEFTPADDING',   (0,0),(0,0),  6),
        ('LEFTPADDING',   (1,0),(1,0),  10),
        ('RIGHTPADDING',  (0,0),(-1,-1), 12),
        ('VALIGN',        (0,0),(-1,-1), 'MIDDLE'),
    ]))
    story.append(ct2)
    story.append(Spacer(1, 6))

story.append(Spacer(1, 30))
story.append(HRFlowable(width='100%', thickness=1, color=LINE))
story.append(Spacer(1, 8))
story.append(Paragraph('Desarrollado por Impulso Web  |  2025', fctr))

doc.build(story, onFirstPage=first_page, onLaterPages=other_pages)
print('PDF generado correctamente.')
