const mongodb = require('./config/mongodb');
var Flower = require('./models/Flower');

Flower.collection.insert([
        {
            name: "Anemone",
            imageUrl: "http://www.namesofflowers.net/images/anemone.jpg", color: 'red', price: 10
        },
        {
            name: "Amaryllis",
            imageUrl: "http://www.namesofflowers.net/images/amaryllis.jpg", color: 'red', price: 10
        },
        {
            name: "Amaranth",
            imageUrl: "http://www.namesofflowers.net/images/amaranth.jpg", color: 'red', price: 10
        },
        {
            name: "Aster",
            imageUrl: "http://www.namesofflowers.net/images/aster.jpg", color: 'red', price: 10
        },
        {
            name: "Azalea",
            imageUrl: "http://www.namesofflowers.net/images/azalea.jpg", color: 'red', price: 10
        },
        {
            name: "Begonia",
            imageUrl: "http://www.namesofflowers.net/images/begonia.jpg", color: 'red', price: 10
        },
        {
            name: "Bergamot",
            imageUrl: "http://www.namesofflowers.net/images/bee-balm.jpg", color: 'red', price: 10
        },
        {
            name: "Bluebell",
            imageUrl: "http://www.namesofflowers.net/images/bluebell.jpg", color: 'red', price: 10
        },
        {
            name: "Bottlebrush",
            imageUrl: "http://www.namesofflowers.net/images/bottlebrush.jpg", color: 'red', price: 10
        },
        {
            name: "Buttercup",
            imageUrl: "http://www.namesofflowers.net/images/buttercup.jpg", color: 'red', price: 10
        },
        {
            name: "Camellia",
            imageUrl: "http://www.namesofflowers.net/images/camellias-flower-2-s.jpg", color: 'red', price: 10
        },
        {
            name: "Carnation",
            imageUrl: "http://www.namesofflowers.net/images/carnation.jpg", color: 'red', price: 10
        },
        {
            name: "Chrysanths",
            imageUrl: "http://www.namesofflowers.net/images/chrysanthemum.jpg", color: 'red', price: 10
        },
        {
            name: "Columbine",
            imageUrl: "http://www.namesofflowers.net/images/columbine.jpg", color: 'red', price: 10
        },
        {
            name: "Clover",
            imageUrl: "http://www.namesofflowers.net/images/clover.jpg", color: 'red', price: 10
        },
        {
            name: "Crocus",
            imageUrl: "http://www.namesofflowers.net/images/crocus.jpg", color: 'red', price: 10
        },
        {
            name: "Daisy",
            imageUrl: "http://www.namesofflowers.net/images/daisy.jpg", color: 'red', price: 10
        },
        {
            name: "Dahlia",
            imageUrl: "http://www.namesofflowers.net/images/dahlia.jpg", color: 'red', price: 10
        },
        {
            name: "Daffodil",
            imageUrl: "http://www.namesofflowers.net/images/daffodil.jpg", color: 'red', price: 10
        },
        {
            name: "Delphinium",
            imageUrl: "http://www.namesofflowers.net/images/delphinium.jpg", color: 'red', price: 10
        },
        {
            name: "Edelweiss",
            imageUrl: "http://www.namesofflowers.net/images/edelweiss.jpg", color: 'red', price: 10
        },
        {
            name: "Primrose",
            imageUrl: "http://www.namesofflowers.net/images/primrose.jpg", color: 'red', price: 10
        },
        {
            name: "Foxglove",
            imageUrl: "http://www.namesofflowers.net/images/foxglove.jpg", color: 'red', price: 10
        },
        {
            name: "Freesia",
            imageUrl: "http://www.namesofflowers.net/images/freesia.jpg", color: 'red', price: 10
        },
        {
            name: "Gerbera",
            imageUrl: "http://www.namesofflowers.net/images/gerbera.jpg", color: 'red', price: 10
        },
        {
            name: "Gladiolus",
            imageUrl: "http://www.namesofflowers.net/images/gladiolus.jpg", color: 'red', price: 10
        },
        {
            name: "Hibiscus",
            imageUrl: "http://www.namesofflowers.net/images/hibiscus.jpg", color: 'red', price: 10
        },
        {
            name: "Heather",
            imageUrl: "http://www.namesofflowers.net/images/heather.jpg", color: 'red', price: 10
        },
        {
            name: "Hyacinth",
            imageUrl: "http://www.namesofflowers.net/images/hyacinth.jpg", color: 'red', price: 10
        },
        {
            name: "Holly",
            imageUrl: "http://www.namesofflowers.net/images/holly.jpg", color: 'red', price: 10
        },
        {
            name: "Iris",
            imageUrl: "http://www.namesofflowers.net/images/iris.jpg", color: 'red', price: 10
        },
        {
            name: "Jasmine",
            imageUrl: "http://www.namesofflowers.net/images/jasmine.jpg", color: 'red', price: 10
        },
        {
            name: "Lavender",
            imageUrl: "http://www.namesofflowers.net/images/lavender.jpg", color: 'red', price: 10
        },
        {
            name: "Lilac",
            imageUrl: "http://www.namesofflowers.net/images/lilac.jpg", color: 'red', price: 10
        },
        {
            name: "Lily",
            imageUrl: "http://www.namesofflowers.net/images/lily.jpg", color: 'red', price: 10
        },
        {
            name: "Marigold",
            imageUrl: "http://www.namesofflowers.net/images/marigold.jpg", color: 'red', price: 10
        },
        {
            name: "Marjoram",
            imageUrl: "http://www.namesofflowers.net/images/marjoram.jpg", color: 'red', price: 10
        },
        {
            name: "Mimosa",
            imageUrl: "http://www.namesofflowers.net/images/mimosa.jpg", color: 'red', price: 10
        },
        {
            name: "Narcissus",
            imageUrl: "http://www.namesofflowers.net/images/narcissus.jpg", color: 'red', price: 10
        },
        {
            name: "Orchid",
            imageUrl: "http://www.namesofflowers.net/images/orchid.jpg", color: 'red', price: 10
        },
        {
            name: "Peony",
            imageUrl: "http://www.namesofflowers.net/images/peony.jpg", color: 'red', price: 10
        },
        {
            name: "Petunia",
            imageUrl: "http://www.namesofflowers.net/images/petunia.jpg", color: 'red', price: 10
        },
        {
            name: "Rhododendron",
            imageUrl: "http://www.namesofflowers.net/images/rhododendron.jpg", color: 'red', price: 10
        },
        {
            name: "Rosemary",
            imageUrl: "http://www.namesofflowers.net/images/rosemary.jpg", color: 'red', price: 10
        },
        {
            name: "Roses",
            imageUrl: "http://www.namesofflowers.net/images/roses.jpg", color: 'red', price: 10
        },
        {
            name: "Sage",
            imageUrl: "http://www.namesofflowers.net/images/sage.jpg", color: 'red', price: 10
        },
        {
            name: "Snapdragon",
            imageUrl: "http://www.namesofflowers.net/images/snapdragon.jpg", color: 'red', price: 10
        },
        {
            name: "Sunflower",
            imageUrl: "http://www.namesofflowers.net/images/sunflower.jpg", color: 'red', price: 10
        },
        {
            name: "Tansy",
            imageUrl: "http://www.namesofflowers.net/images/tansy.jpg", color: 'red', price: 10
        },
        {
            name: "Thistle",
            imageUrl: "http://www.namesofflowers.net/images/thistle.jpg", color: 'red', price: 10
        },
        {
            name: "Thyme",
            imageUrl: "http://www.namesofflowers.net/images/thyme.jpg", color: 'red', price: 10
        },
        {
            name: "Tulip",
            imageUrl: "http://www.namesofflowers.net/images/tulip.jpg", color: 'red', price: 10
        },
        {
            name: "Violets",
            imageUrl: "http://www.namesofflowers.net/images/violets.jpg", color: 'red', price: 10
        },
        {
            name: "Zinnia",
            imageUrl: "http://www.namesofflowers.net/images/zinnia.jpg", color: 'red', price: 10
        }
    ]
    , function (err, docs) {
        if (err) {
            console.log(err.message);
            return console.error(err);
        }
        console.log("Multiple documents inserted to Collection" + docs);
        process.exit(0);
    });
