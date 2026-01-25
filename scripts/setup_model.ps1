Write-Host "Deploying Animal Classifier Model..."

$Source = "models\animal_classifier.pth"
$Dest = "backend\ml_models\animal_classifier.pth"
$ClassesSource = "models\classes.json"
$ClassesDest = "backend\ml_models\classes.json"

if (Test-Path $Source) {
    Copy-Item $Source -Destination $Dest -Force
    Write-Host "Model copied successfully to backend."
}
else {
    Write-Host "Error: Model file not found at $Source"
    Write-Host "Please wait for training to complete."
    exit 1
}

if (Test-Path $ClassesSource) {
    Copy-Item $ClassesSource -Destination $ClassesDest -Force
    Write-Host "Classes file copied successfully."
}

Write-Host "Deployment complete. Please restart the backend server."
