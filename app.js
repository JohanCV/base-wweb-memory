const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const WebWhatsappProvider = require('@bot-whatsapp/provider/web-whatsapp')
const MockAdapter = require('@bot-whatsapp/database/mock')

let fullname
let email
let dni
let inicio = 'Hola'
let choseCourse

const flowBack = addKeyword(['0','anterior','regresar']).addAnswer(
    ['Hasta otra oportunidad!!'],
    null,
    null,
    []
)

const flowEnrollCourseParte2 = addKeyword(['Si','si']).addAnswer(
    ['❌ Escirbir *Cancelar* Matricula ❌','\n Cual es su Correo Institucional?'],
    { capture: true},    
    (ctx, { flowDynamic, endFlow }) => {
        if (ctx.body == 'Cancelar' || ctx.body == 'cancelar')
            return endFlow({body: `❌ Su Matricula ha sido cancelada ❌ \n Puede iniciar nuevamente diciendome *${inicio}*`})

        email = ctx.body
        console.log('Mensaje entrante correo: ',email,choseCourse )
        return flowDynamic(`se registro *${email}*, continuamos...`)
    }
).addAnswer(
    ['❌ Escirbir *Cancelar* Matricula ❌','Cual es su DNI?'],
    { capture: true}
)

const flowEnrollCourse = addKeyword(['A','a','B','b','C','c','D','d','E','e','F','f','G','g','H','h']).addAnswer(
        ['❌ Escirbir *Cancelar* Matricula ❌','Para la realizacion de su matricula al Curso: *Aulas Virtuales I - Moodle Basico*',
         'Ingrese los siguientes datos:','Cuales son  sus *Nombres y Apellidos* Completos?'
        ],
        { capture: true},    
        (ctx, { flowDynamic, endFlow }) => {
            if (ctx.body == 'Cancelar' || ctx.body == 'cancelar')
                return endFlow({body: `❌ Su Matricula ha sido cancelada ❌ \n Puede iniciar nuevamente diciendome *${inicio}*`})

            fullname = ctx.body
            console.log('Mensaje entrante fullname: ',fullname,choseCourse )
            return flowDynamic(`Encantado *${fullname}*, Desea continuar? \n Escriba *Si* para continuar \n Escriba *No* para cancelar`)
        },
        [flowEnrollCourseParte2]
)
    // .addAnswer(
    //     ['❌ Escirbir *Cancelar* Matricula ❌','Cual es su Correo Institucional?']
    // )
    
   

const flowGracias = addKeyword(['gracias', 'grac']).addAnswer(
    [
        '🚀 Hasta otra oportunidad!!',
        '\n*0* Para terminar la conversacion.'
    ],
    null,
    null,
    [flowBack]
)

const flowEnsenanza = addKeyword(['3']).addAnswer(
    ['Si usted se ha registrado previamente en un curso de DUTIC de clic en el siguiente Para acceder a la plataforma DUTIC CAPACITACIONES:',
     'https://dutic.unsa.edu.pe/#/virtualTeaching/trainings', '\n*0* Para terminar la conversacion.'],
    null,
    null,
    [flowBack]
)

const flowVerCurso = addKeyword(['2']).addAnswer(
    ['Si usted ha llevado un curso en DUTIC anteriormente y desea revisar su material de clic en el sgte enlace y acceda con su correo institucional: '
      , 'https://dutic.unsa.edu.pe/capacitacion2022/login/index.php', '\n*0* Para terminar la conversacion.'],
    null,
    null,
    [flowBack]
)

const flowSelectCourse = addKeyword(['1']).addAnswer(
        ['\n *0* Para regresar al *paso anterior*.'],
        null,
        null,
        [flowBack]
    )
    .addAnswer('Selecciona una Letra, el Curso 📕📘 de tu Preferencia 👇👇')
    .addAnswer( 
        [
            '📕 *A* - Aulas Virtuales I - Moodle Basico',
            '📘 *B* - Aulas Virtuales II- Moodle Intermedio',
            '📗 *C* - Aulas Virtuales III- Moodle Avanzado',
            '📙 *D* - Curso Integral de Moodle para la Docencia',
            '📓 *E* - Herramientas de Gamificación para la Docencia',
            '📕 *F* - Herramientas Digitales para la Docencia',
            '📘 *G* - Creación de Contenidos Educativos Digitales con eXeLearning',
            '📗 *H* - Google Workspace for Education',                  
        ],
        { capture: true},
        (ctx) => {
            choseCourse = ctx.body
            console.log('Mensaje entrante Curso Escogido: ',choseCourse)
        },
        [flowEnrollCourse]            
    ) 



const flowStart = addKeyword(['Hi','ola','Hola','Holi','Buenos Dias','Buenas Tardes','Buenas Noches'])
    .addAnswer('🙌 Hola Bienvenid@ a este *Chatbot de DUTIC*')
    .addAnswer('Por este medio te ayudaremos con la matriculacion de los cursos que estamos ofertando para tu mejora en el uso de las TICs')
    .addAnswer('Escribe el Numero Que Deseas')
    .addAnswer( 
        [
            '👉 *1* Matricularse a un Curso',
            '👉 *2* Ver Mis Cursos',
            '👉 *3* Enseñanza Virtual',
        ],
        null,
        null,
        [flowSelectCourse, flowVerCurso, flowEnsenanza]
    )
    

const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowStart])
    const adapterProvider = createProvider(WebWhatsappProvider)
    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    adapterProvider.on('message',(ctx) => {
        if(ctx.body != ''){
            console.log(ctx.body)            
        }
    },null,[flowStart])
    
}

QRPortalWeb({port:4005})
main()
