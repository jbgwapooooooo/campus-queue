package com.example.campusqueue.features.auth.login
import com.example.campusqueue.network.RetrofitClient
import com.example.campusqueue.network.models.LoginRequest
import com.example.campusqueue.network.models.SupabaseAuthResponse
import org.json.JSONObject
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class LoginPresenter(private var view: LoginContract.View?) : LoginContract.Presenter {
    override fun login(email: String, password: String) {
        if (email.isEmpty() || password.isEmpty()) {
            view?.showError("Email and Password cannot be empty")
            return
        }
        view?.showLoading()
        val request = LoginRequest(email, password)
        RetrofitClient.instance.login(request).enqueue(object : Callback<SupabaseAuthResponse> {
            override fun onResponse(call: Call<SupabaseAuthResponse>, response: Response<SupabaseAuthResponse>) {
                view?.hideLoading()
                if (response.isSuccessful) {
                    val token = response.body()?.access_token
                    if (!token.isNullOrEmpty()) {
                        com.example.campusqueue.utils.SessionManager.saveEmail(email)
                        view?.onLoginSuccess(token)
                    } else {
                        view?.showError("Login successful but token is missing")
                    }
                } else {
                    val errorBody = response.errorBody()?.string()
                    val errorMessage = try {
                        val json = JSONObject(errorBody ?: "")
                        json.optString("msg", json.optString("error_description", json.optString("message", "Login Failed")))
                    } catch (e: Exception) {
                        "Login Failed"
                    }
                    view?.showError(errorMessage)
                }
            }
            override fun onFailure(call: Call<SupabaseAuthResponse>, t: Throwable) {
                view?.hideLoading()
                view?.showError("Network Error: ${t.message}")
            }
        })
    }
    override fun onDestroy() { view = null }
}
