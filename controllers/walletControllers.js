
const walletLoad = (req, res) => {
    try {
        res.render('user/page-wallet')
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    walletLoad
}