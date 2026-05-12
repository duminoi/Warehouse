$srcPath = "f:\Projects\Test\docs\dev_test.docx"
$copyPath = "f:\Projects\Test\docs\dev_test_copy.docx"

Copy-Item $srcPath $copyPath

Add-Type -AssemblyName 'System.IO.Compression.FileSystem'
$zip = [System.IO.Compression.ZipFile]::OpenRead($copyPath)

# Read document.xml with UTF-8
$entry = $zip.GetEntry('word/document.xml')
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8)
$xmlContent = $reader.ReadToEnd()
$reader.Close()
$stream.Close()

# List all entries to find images
Write-Output "=== ALL ENTRIES ==="
foreach($e in $zip.Entries) {
    Write-Output $e.FullName
}

# Extract images
foreach($e in $zip.Entries) {
    if($e.FullName -match '^word/media/') {
        $imgName = [System.IO.Path]::GetFileName($e.FullName)
        $imgPath = "f:\Projects\Test\docs\$imgName"
        $imgStream = $e.Open()
        $fileStream = [System.IO.File]::Create($imgPath)
        $imgStream.CopyTo($fileStream)
        $fileStream.Close()
        $imgStream.Close()
        Write-Output "Extracted: $imgPath"
    }
}

$zip.Dispose()
Remove-Item $copyPath

# Parse XML
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[xml]$doc = $xmlContent
$ns = New-Object System.Xml.XmlNamespaceManager($doc.NameTable)
$ns.AddNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main')

Write-Output ""
Write-Output "=== DOCUMENT TEXT ==="
$paragraphs = $doc.SelectNodes('//w:p', $ns)
foreach($p in $paragraphs) {
    $texts = $p.SelectNodes('.//w:t', $ns)
    $line = ''
    foreach($t in $texts) {
        $line += $t.InnerText
    }
    Write-Output $line
}
