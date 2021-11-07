// save original unit preferences to restore later
var originalUnit = app.preferences.rulerUnits

// compareFunction for built-in Array.sort() function. Returns [folder1's colour index] - [folder2's colour index]
function compareFoldersB(folder1, folder2) {
    return parseInt(folder1.displayName.substring(folder1.displayName.lastIndexOf("-C") + 2, folder1.displayName.lastIndexOf(".")))
           - parseInt(folder2.displayName.substring(folder2.displayName.lastIndexOf("-C") + 2, folder2.displayName.lastIndexOf(".")))
}

// compareFunction for built-in Array.sort() function. Returns [folder1's colour index] - [folder2's colour index]
function compareFolders20(folder1, folder2) {
    var folder1ColourIndex = folder1.displayName.substring(folder1.displayName.lastIndexOf("C") + 1, folder1.displayName.lastIndexOf(".") - 1)
    var folder2ColourIndex = folder2.displayName.substring(folder2.displayName.lastIndexOf("C") + 1, folder2.displayName.lastIndexOf(".") - 1)
    if (folder1ColourIndex == folder2ColourIndex) {
        return folder1.displayName.substring(folder1.displayName.lastIndexOf(".") - 1, folder1.displayName.lastIndexOf(".")) === "s" ? -1 : 1
    }
    return parseInt(folder1ColourIndex) - parseInt(folder2ColourIndex)
}

function main() {
    var folders = Folder("D:/网站照片").getFiles()

    for (var i = 0; i < folders.length; ++i) {
        // var docRefMain = app.documents.add(210, 297)
        // docRefMain.resizeImage(210, 297, 300, ResampleMethod.AUTOMATIC)
        // var debugArtLayer = docRefMain.artLayers.add()
        // debugArtLayer.kind = LayerKind.TEXT
        // debugArtLayer.textItem.contents = folders[0].displayName
        // return
        if (folders[i].displayName.substring(0, 2) === "20") {
            var cFiles = folders[i].getFiles()
            var currentModelNumber = ""
            var modelFiles = []
            for (var j = 0; j < cFiles.length; ++j) {
                var modelNumber = cFiles[j].displayName.substring(0, cFiles[j].displayName.lastIndexOf("C"))
                if (modelNumber != currentModelNumber) {
                    modelFiles.push(folders[i].getFiles(modelNumber + "*"))
                    modelFiles[modelFiles.length - 1].sort(compareFolders20)
                    currentModelNumber = modelNumber
                }
            }
            for (var j = 0; j < modelFiles.length; ++j) {
                // make a4
                preferences.rulerUnits = Units.MM
                var docRefMain = app.documents.add(210, 297)
                docRefMain.resizeImage(210, 297, 300, ResampleMethod.AUTOMATIC)
                preferences.rulerUnits = Units.PIXELS
                
                // copy c1 (or first colour index) to main
                var docRefC1 = app.open(modelFiles[j][0])
                docRefC1.artLayers["Background"].copy()
                docRefC1.close()
                docRefMain.paste()
                
                // move c1 to top
                var artLayerC1 = docRefMain.artLayers["Layer 1"]
                artLayerC1.translate(0, - artLayerC1.bounds[1])

                for (var k = 1; k < modelFiles[j].length; ++k) {
                    // copy ck to main
                    var docRefCk = app.open(modelFiles[j][k])
                    docRefCk.selection.select([[0, 215], [0, 970], [1920, 970], [1920, 215]])
                    docRefCk.selection.copy()
                    docRefCk.close()
                    docRefMain.paste();

                    // resize ck so document width fits 2 smaller images
                    var artLayerCk = docRefMain.artLayers["Layer " + (k + 1)]
                    var resizePercent = (docRefMain.width / 2) / (artLayerCk.bounds[2] - artLayerCk.bounds[0]) * 100
                    artLayerCk.resize(resizePercent, resizePercent)

                    // move ck to the corresonding column and row
                    // artLayerCk.translate(Math.floor(k / 2) % 3 * docRefMain.width / 3 - artLayerCk.bounds[0], artLayerC1.bounds[3] - artLayerCk.bounds[1] + (k % 2 + 2 * Math.floor(k / 6)) * (artLayerCk.bounds[3] - artLayerCk.bounds[1]))
                    artLayerCk.translate(k % 2 * docRefMain.width / 2 - artLayerCk.bounds[0], artLayerC1.bounds[3] - artLayerCk.bounds[1] + Math.floor(k / 2) * (artLayerCk.bounds[3] - artLayerCk.bounds[1]))
                }
                
                // save as pdf
                var saveOptions = new PDFSaveOptions()
                saveOptions.alphaChannels = false
                saveOptions.annotations = false
                saveOptions.convertToEightBit = true
                saveOptions.destinationProfile = "Working RGB"
                saveOptions.downSample = PDFResample.NONE
                saveOptions.embedThumbnail = false
                saveOptions.layers = false
                saveOptions.preserveEditing = false
                saveOptions.profileInclusionPolicy = true
                docRefMain.saveAs(new File("D:/catalogue pdfs/" + modelFiles[j][0].displayName.substring(0, modelFiles[j][0].displayName.lastIndexOf("C")) + ".pdf"), saveOptions, false, Extension.LOWERCASE)
                docRefMain.close(SaveOptions.DONOTSAVECHANGES)
            }
        } else {
            // make a4
            preferences.rulerUnits = Units.MM
            var docRefMain = app.documents.add(210, 297)
            docRefMain.resizeImage(210, 297, 300, ResampleMethod.AUTOMATIC)
            preferences.rulerUnits = Units.PIXELS
            
            // copy c1 (or first colour index) to main
            var cFiles = folders[i].getFiles("*-C*")
            cFiles.sort(compareFoldersB)
            var docRefC1 = app.open(cFiles[0])
            docRefC1.artLayers["Background"].copy()
            docRefC1.close()
            docRefMain.paste()

            // move c1 to top
            var artLayerC1 = docRefMain.artLayers["Layer 1"]
            artLayerC1.translate(0, - artLayerC1.bounds[1])

            for (var j = 1; j < cFiles.length; ++j) {
                // copy cj to main
                var docRefCj = app.open(cFiles[j])
                docRefCj.selection.select([[0, 215], [0, 970], [1920, 970], [1920, 215]])
                docRefCj.selection.copy()
                docRefCj.close()
                docRefMain.paste();

                // resize cj so document width fits 2 smaller images
                var artLayerCj = docRefMain.artLayers["Layer " + (j + 1)]
                var resizePercent = (docRefMain.width / 2) / (artLayerCj.bounds[2] - artLayerCj.bounds[0]) * 100
                artLayerCj.resize(resizePercent, resizePercent)

                // move cj to the corresonding column and row
                artLayerCj.translate((j - 1) % 2 * docRefMain.width / 2 - artLayerCj.bounds[0], artLayerC1.bounds[3] - artLayerCj.bounds[1] + Math.floor((j - 1) / 2) * (artLayerCj.bounds[3] - artLayerCj.bounds[1]))
            }
            
            // save as pdf
            var saveOptions = new PDFSaveOptions()
            saveOptions.alphaChannels = false
            saveOptions.annotations = false
            saveOptions.convertToEightBit = true
            saveOptions.destinationProfile = "Working RGB"
            saveOptions.downSample = PDFResample.NONE
            saveOptions.embedThumbnail = false
            saveOptions.layers = false
            saveOptions.preserveEditing = false
            saveOptions.profileInclusionPolicy = true
            docRefMain.saveAs(new File("D:/catalogue pdfs/" + folders[i].displayName + ".pdf"), saveOptions, false, Extension.LOWERCASE)
            docRefMain.close(SaveOptions.DONOTSAVECHANGES)
        }
    }
}

main()

// restore original unit preferences
app.preferences.rulerUnits = originalUnit
