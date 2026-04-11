package com.example.campusqueue.features.profile.update

import android.app.Activity
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Bundle
import android.util.Base64
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import com.example.campusqueue.R
import java.io.ByteArrayOutputStream

class UpdateProfileActivity : AppCompatActivity(), UpdateProfileContract.View {
    private lateinit var presenter: UpdateProfilePresenter
    private lateinit var etName: EditText
    private lateinit var etEmail: EditText
    private lateinit var etCurrentPassword: EditText
    private lateinit var etNewPassword: EditText
    private lateinit var btnUpdate: Button
    private lateinit var btnSelectAvatar: Button
    private lateinit var ivAvatarPreview: ImageView
    private lateinit var progressBar: ProgressBar

    private var selectedAvatarBase64: String? = null
    private val IMAGE_PICK_CODE = 1001

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_update_profile)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        presenter = UpdateProfilePresenter(this)

        etName = findViewById(R.id.etName)
        etEmail = findViewById(R.id.etEmail)
        etCurrentPassword = findViewById(R.id.etCurrentPassword)
        etNewPassword = findViewById(R.id.etNewPassword)
        btnUpdate = findViewById(R.id.btnUpdate)
        btnSelectAvatar = findViewById(R.id.btnSelectAvatar)
        ivAvatarPreview = findViewById(R.id.ivAvatarPreview)
        progressBar = findViewById(R.id.progressBar)

        btnSelectAvatar.setOnClickListener {
            val intent = Intent(Intent.ACTION_PICK)
            intent.type = "image/*"
            startActivityForResult(intent, IMAGE_PICK_CODE)
        }

        btnUpdate.setOnClickListener {
            val name = etName.text.toString().trim()
            val email = etEmail.text.toString().trim()
            val currentPass = etCurrentPassword.text.toString()
            val newPass = etNewPassword.text.toString()
            presenter.updateProfileInfo(name, email, currentPass, newPass, selectedAvatarBase64)
        }

        presenter.fetchProfile()
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == IMAGE_PICK_CODE && resultCode == Activity.RESULT_OK) {
            val uri: Uri? = data?.data
            if (uri != null) {
                val inputStream = contentResolver.openInputStream(uri)
                val bitmap = BitmapFactory.decodeStream(inputStream)
                // Compress to JPEG and convert to base64
                val outputStream = ByteArrayOutputStream()
                bitmap.compress(Bitmap.CompressFormat.JPEG, 70, outputStream)
                val byteArray = outputStream.toByteArray()
                val base64 = "data:image/jpeg;base64," + Base64.encodeToString(byteArray, Base64.NO_WRAP)
                selectedAvatarBase64 = base64
                ivAvatarPreview.setImageBitmap(bitmap)
            }
        }
    }

    override fun onProfileLoaded(name: String, email: String, avatarBase64: String?) {
        etName.setText(name)
        etEmail.setText(email)
        if (!avatarBase64.isNullOrEmpty()) {
            try {
                val clean = avatarBase64.substringAfter("base64,")
                val decoded = Base64.decode(clean, Base64.DEFAULT)
                val bitmap = BitmapFactory.decodeByteArray(decoded, 0, decoded.size)
                ivAvatarPreview.setImageBitmap(bitmap)
            } catch (e: Exception) { e.printStackTrace() }
        }
    }

    override fun showLoading() { progressBar.visibility = View.VISIBLE; btnUpdate.isEnabled = false }
    override fun hideLoading() { progressBar.visibility = View.GONE; btnUpdate.isEnabled = true }
    override fun showError(message: String) { Toast.makeText(this, message, Toast.LENGTH_SHORT).show() }
    override fun onProfileUpdated() {
        Toast.makeText(this, "Profile Updated!", Toast.LENGTH_SHORT).show()
        finish()
    }
    override fun onDestroy() {
        presenter.onDestroy()
        super.onDestroy()
    }
}

