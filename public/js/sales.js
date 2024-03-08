let serverID = location.pathname.replace('/server/sales/', "")


loadBanks();
async function loadBanks() {
    try {
        const response = await fetch('https://brasilapi.com.br/api/banks/v1');
        const banks = await response.json();
        banks.forEach(bank => {
            if (bank.code != null) {
                const option = new Option(bank.code + " - " + bank.name,bank.code)
                document.getElementById('bank-input-list').appendChild(option);
            }
        });
    } catch (error) {
        console.error('Erro ao carregar os bancos:', error);
    }
}


document.getElementById('cpf-input').addEventListener('input',(e)=>{
    let cpf = e.target.value.replace(/\D/g, '');
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    e.target.value = cpf;
});
document.getElementById('account-number').addEventListener('input',(e)=>{
    let numeroConta = e.target.value.replace(/\D/g, ''); 
    numeroConta = numeroConta.replace(/(\d{8})(\d{1})/, '$1-$2');
    e.target.value = numeroConta;
})





document.getElementById('save-button').addEventListener('click',async()=>{
    let name = document.getElementById('complete-name').value
    let cpf = document.getElementById('cpf-input').value
    let bank = document.getElementById('bank-name-input').value
    let numero = document.getElementById('account-number').value
    let agencia = document.getElementById('bank-agenc').value
    const response = await fetch('https://brasilapi.com.br/api/banks/v1');
    const banks = await response.json();
    let findbank = banks.find(element=>element.code == bank)
    
    if (checkbox.checked == false) {errorNotify('Aceite os termos de uso!')
    return}
    if (name.trim().length < 1) {errorNotify('Escreva seu nome primeiro!')
    return}
    if (cpf.trim().length <= 13) {errorNotify('Escreva seu CPF primeiro!') 
    return}
    if (bank.trim().length < 1 || findbank == undefined ||  findbank == null) {errorNotify('Coloque o nome do seu banco primeiro!')
    return}
    if (numero.trim().length <= 9) {errorNotify('Escreva o numero da sua conta primeiro!')
    return}
    if (agencia.trim().length <= 3) {errorNotify('Escreva o numero da agencia primeiro!')
    return}



    await $.ajax({
        traditional: true,
        url: '/addDadosBanc',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify( {
            name:name,
            cpf:cpf,
            bank:bank,
            numero:numero,
            agencia:agencia,
            serverID:serverID
        } ),
        dataType: 'json',
        success: function(response) {
            console.log(response);
            if (response.success == true) {
                successNotify('Dados Bancarios Salvos!')
            }else{
                errorNotify("Erro ao salvar os dados bancarios verifique se digitou corretamente os dados!")
            }
        },
        error: function(xhr, status, error) {
            console.error(error);
        }
    })

})